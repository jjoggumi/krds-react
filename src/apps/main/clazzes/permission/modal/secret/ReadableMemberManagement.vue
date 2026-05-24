<!--
@File(Method): ReadableMemberManagement.vue
@Author: 권영준
@Date Created: - 2024-11-27
@Description: 게시판 추가 > 비밀게시판 > 게시판 권한 설정 > 게시판 권한 설정 모달 > 읽기 권한 추가/해제 모달
-->
<template>
  <HiModal type="type01" size="lg" @close="modalClose" class="readable_manage">
    <template v-slot:heading>
      읽기 권한 추가/해제
      <div class="smr">
        게시판을 읽을 수 있는 구성원을 선택해주세요.
      </div>
    </template>
    <template v-slot:content>
      <member-picker v-model="innerValue"/>
    </template>
    <template v-slot:footer>
      <HiButton color="light-primary" outline size="lg" @click="modalClose">취소</HiButton>
      <HiButton color="primary" size="lg" @click="handleSave">선택완료</HiButton>
    </template>
  </HiModal>
</template>

<script>
import MemberPicker from '@/apps/main/clazzes/components/MemberPicker.vue'

export default {
  name: 'readable-member-management',
  components: { MemberPicker },
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(value) {
        this.innerValue = value
      }
    }
  },
  data: () => ({ innerValue: [] }),
  methods: {
    modalClose() {
      this.$emit('close')
    },
    handleSave() {
      this.$emit('input', this.innerValue)
      this.modalClose()
    }
  }
}
</script>