<template>
  <div class="join-with-invite-code-process">
    <join-with-invite-code
      v-if="joinWithInviteCode.isOpen"
    />

    <join-with-invite-code-parents
      v-if="joinWithInviteCodeParents.isOpen"
      @moveHome="$router.go(0)"
    />

    <join-with-invite-code-student
      v-if="joinWithInviteCodeStudent.isOpen"
      @moveHome="$router.go(0)"
    />
  </div>
</template>
<script>
import EnterCode from '@/components/Popup/JoinWithInviteCode/JoinWithInviteCode.vue'
import StepForParent from '@/components/Popup/JoinWithInviteCode/JoinWithInviteCodeParents.vue'
import StepForStudent from '@/components/Popup/JoinWithInviteCode/JoinWithInviteCodeStudent.vue'
import { mapState } from 'vuex'

export default {
  name: 'join-with-invite-code-process',
  components: {
    'join-with-invite-code': EnterCode,
    'join-with-invite-code-parents': StepForParent,
    'join-with-invite-code-student': StepForStudent
  },
  computed: {
    ...mapState('storeHome', [
      'joinWithInviteCode',
      'joinWithInviteCodeParents',
      'joinWithInviteCodeStudent'
    ])
  }
}
</script>