<!--
@File(Method): ApplyMemberList.vue
@Date Created: 2025-01-09
@Description: 클래스 구성원 관리 > 가입 요청 구성원 목록
@Modified: #72513 가입 요청 수락 팝업 > 태그 입력 생성 및 자동 완성 추가
-->
<template>
  <div class="class-join-request-wrap">
    <div class="list-wrap boundary-box">
      <div class="title-wrap">
        <div class="title">
          {{ $t('main.clazzes.member.text.classSubscribeApply') }}
          <span>({{ clazzApplyMembers.length || 0 }})</span>
        </div>
      </div>
      <ul>
        <apply-member-item
            v-for="(member, index) in clazzApplyMembers"
            :key="member.userId"
            :index="index"
            :member="member"
            @updateMemberStatus="updateMemberStatus"
        />
      </ul>
    </div>

    <member-approval-modal
        v-if="isOpenMemberApproval"
        :memberId="approvalMemberId"
        :classId="clazzes.currentId"
        @updateMemberStatus="updateMemberStatus"
        @closeMemberApprovalModal="closeMemberApprovalModal"
    />
  </div>
</template>

<script>
import ApplyMemberItem from './ApplyMemberItem'
import MemberApprovalModal from "@/apps/main/clazzes/member/modal/MemberApproval";
import { useClassErrorManager } from "@/apps/main/clazzes/utils";
import {mapActions} from "vuex";
const errorManager = useClassErrorManager();


export default {
  name: 'apply-member-list',
  props: {
    clazzes: Object,
    clazzApplyMembers: Array
  },
  data() {
    return {
      isOpenMemberApproval: false,
      approvalMemberId: ''
    }
  },
  components: {
    MemberApprovalModal,
    ApplyMemberItem
  },
  methods: {
    ...mapActions('storeClazzTag', ['fetchTags']),
    openMemberApprovalModal(memberId) {
      this.approvalMemberId = memberId
      this.isOpenMemberApproval = true
    },
    closeMemberApprovalModal() {
      this.approvalMemberId = ''
      this.isOpenMemberApproval = false
      this.fetchTags(this.clazzes.currentId)
    },
    async updateMemberStatus({memberStatus, member}) {
      if (!memberStatus) {
        this.openMemberApprovalModal(member.memberId)
        return
      }

      try {
        let memberSubscribe = {
          memberChildName: member.studentName,
          memberClassNumber: member.studentNo,
          isApplyCheck: true,
          tagIds: member.tags.map(tag => tag.tagId),
          memberStatus
        }
        await this.$axios.patch(`/clazzSubscribes/${member.memberId}`, memberSubscribe)

        if (memberStatus === 'ACCEPT') {
          // 수락 후 학교 구독
          this.$hiClass.isDuplSubscribeSchoolAndSchoolSubscribe(
              this, this.clazzes.school.currentId, member.userId, 'CLASS'
          )
          this.$emit('addClazzMembersByIndex', { ...member, memberStatus })
        }

        const idx = this.clazzApplyMembers.findIndex(member => member.memberId === member.memberId)
        idx > -1 ? this.$emit('deleteClazzApplyMemberByIndex', idx) : null
      } catch (err) {
        const isRefresh = errorManager.showErrorMsg('MEMBER', err)
        if (isRefresh) {
          const idx = this.clazzApplyMembers.findIndex(member => member.memberId === member.memberId)
          idx > -1 ? this.$emit('deleteClazzApplyMemberByIndex', idx) : null
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
.list-wrap.boundary-box {
  margin-top: 17px;
}
</style>