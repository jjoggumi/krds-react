<!--
@File(Method): ApplyMemberItem.vue
@Date Created: 2025-01-09
@Description: 클래스 구성원 관리 > 가입 요청 구성원
@Modified: #69560 클래스 구성원 관리 태그 추가 , 구성원관리에 선생님 목록 이동
-->
<template>
  <li>
    <div class="inner">
      <div
          class="profile-img-wrap"
          :class="{ new: isNewMember }"
          :style="userPhotoStyleObj"
      />
      <div class="profile-name-wrap student">
        <div class="name req-join">
          <div v-if="isStudent" class="profile-order-wrap-n">
            <span class="bg-no">{{ member.studentNo }}</span>
          </div>
          {{ `${member.studentName.substring(0, 20)} ${isStudent ? '학생' : '학부모'}` }}
        </div>
        <div class="hp-num req-join">
          {{ member.profileName || '' }} {{ ' ' }}
          {{ $stringUtil.phoneFormatter(member.mobileNumber || '') }}
        </div>
      </div>

      <div class="btn-wrap req-join">
        <HiButton color="default" outline @click="updateMemberStatus('DENIAL')">
          {{ $t('main.clazzes.member.button.denial') }}
        </HiButton>
        <HiButton color="primary" @click="updateMemberStatus(null)">
          {{ $t('main.clazzes.member.button.accept') }}
        </HiButton>
      </div>
    </div>
  </li>
</template>

<script>
export default {
  name: 'apply-member-item',
  props: {
    member: {
      type: Object
    },
    index: {
      type: Number
    }
  },
  data() {
    return {
      isNewMember: false
    }
  },
  computed: {
    isStudent() {
      return this.member.userType === 'STUDENT'
    },
    profilePhotoSrc() {
      if (this.member.profilePhoto) {
        return this.member.profilePhoto
      }
      return '/files/img/profile_default.png'
    },
    userPhotoStyleObj() {
      return `background-image:url('${this.profilePhotoSrc}'); background-size: 66px 66px;`
    }
  },
  methods: {
    updateMemberStatus(memberStatus) {
      this.$emit('updateMemberStatus', { memberStatus, member: this.member })
    }
  }
}
</script>
<style scoped lang="scss">
.profile-name-wrap.student {
  .name {
    display: flex;
    align-items: center;

    .profile-order-wrap-n {
      .bg-no {
        margin-bottom: 0;
      }
    }
  }
}
</style>