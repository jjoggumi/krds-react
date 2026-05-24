<!--
@File(Method): PersonnelLevel.vue
@Description: #74548 학급기록 > 인원체크 > 상세 > 평가판 입력 td
-->
<template>
  <td :class="{'disabled' : disabled}" :id="`levelComment-${studentId}-${itemKey}`">
    <div class="input-text">
      <input type="text" maxlength="3"
        v-model="inputValue"
        @keyup="onKeyupLevelComment($event)"
        @blur="onBlurLevelComment($event)"
        @focus="onKeyupLevelComment($event)"
      />
    </div>
  </td>
</template>

<script>
import { useChecklistController } from '@/apps/behavior/modules/personnel';
const checklistController = useChecklistController();
import {mapState} from "vuex";

import {debounce} from "lodash";

export default {
  name: 'PersonnelLevel',
  props: {
    value: { type: String, default: '' },
    itemKey: {type: String, required: true },
    checklistId: { type: String, required: true },
    studentId: { type: String, required: true },
    disabled: { type: Boolean, default: false }
  },
  computed: {
    ...mapState(['user']),
    ...mapState('storeBehavior', ['isExternalChecklist']),
    userId() {
      return this.user.currentId || null
    },
    inputValue: {
      get() {
        return this.value || ''
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  },
  methods: {
    onKeyupLevelComment: function(e) {
      // 문자열 입력만 허용, 최대 3자
      const limited = e.target.value.replace(/[^A-Za-z0-9ㄱ-힣]/g, '').substring(0, 3)
      this.setInputValue(e, limited)
      if (this.isExternalChecklist) {
        this.$emit('checkBannedWord', e, limited)
      }
      this.debouncedUpdateLevelComment(e, limited)
    },
    onBlurLevelComment: function (e) {
      const limited = e.target.value.replace(/[^A-Za-z0-9ㄱ-힣]/g, '').substring(0, 3)
      this.setInputValue(e, limited)
      this.updateLevelComment(e, limited)
    },
    setInputValue(e, value) {
      this.inputValue = value
      e.target.value = value
    },
    updateLevelComment: async function(e, value) {
      if (e.target.parentNode.parentNode.classList.contains('banned')) {
        return
      }

      // 저장
      try {
        await checklistController.updateChecklistLevelComment(this.isExternalChecklist, {
          userId : this.userId,
          studentId: this.studentId,
          itemKey: this.itemKey,
          levelComment: value
        })
        this.$emit('sendWebsocket', {
          eventType: 'writeLevelComment',
          studentId: this.studentId,
          itemKey: this.itemKey,
          levelComment: value
        })
      } catch (err) {
        this.$emit('handleError', err, { eventName: 'updateLevelComment', elId: `#levelComment-${this.studentId}-${this.itemKey}` })
        this.$log.debug('classroom checklist level PATCH() error => ', err)
      }
    },
    debouncedUpdateLevelComment: debounce(async function(e, value) {
      await this.updateLevelComment(e, value)
    }, 300),
  },
}
</script>