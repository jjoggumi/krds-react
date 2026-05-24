<template>
  <i v-if="roomItem.roomType === 'GROUP'" :class='iconOfGroupType'/>
</template>

<script>
import {isExpiredRoom} from '@/apps/hitalk/utils'

export default {
  props: {
    roomItem: {
      type: Object,
      required: true
    }
  },
  computed: {
    iconOfGroupType() {
      let result = [{
        'NOTICE': 'chat-type-noti',
        'GENERAL': 'chat-type-normal',
        'LIMIT': 'chat-type-period'
      }[this.roomItem.groupType || ''] || 'chat-type-noti']
      if (isExpiredRoom(this.roomItem)) {
        result.push('dis')
      }
      return result
    }
  }
}
</script>