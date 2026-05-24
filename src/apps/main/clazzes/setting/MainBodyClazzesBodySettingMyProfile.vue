<!--
@File(Method): MainBodyClazzesBodySettingMyProfile.vue
@Description: 클래스 > 관리자 메뉴 > 클래스 설정 > 내 프로필 관리 탭
@Modified: 2025-03-05 - #72684 프로필 이미지 아바타(HiAvatar) 구축 및 적용
-->
<template>
  <div class="setting-category-wrap profile first"
    :class="{
      'parent': !isManager
    }"
  >
    <div class="category-title">내 프로필</div>
    <div class="my-profile">
      <HiAvatar
        size="lg" 
        outline
        :img="userPhoto ? userPhoto : null"
      />      
      <!--#72684 프로필 이미지 아바타(HiAvatar) 적용 전
      <div class="image">
        <p class="photo">
          <img :src="userPhoto" />
        </p>
      </div>
      -->
      <div class="name">
        <span class="user-name">{{ classUser.userName }}</span>
        <span class="user-type" v-if="isManager">
          <template v-if="isClassOwner">
            클래스 개설자
          </template>

          <template v-else>
            클래스 관리자
          </template>
        </span>
        <span class="user-type" v-else>
          <template v-if="userType === 'STUDENT'">
            {{ memberChildName }} 학생
          </template>

          <template v-else-if="userType === 'PARENTS'">
            {{ memberChildName }} 학부모
          </template>
        </span>
      </div>
      <div class="btn">
        <button @click="openProfileSettingModal">
          <span class="i"></span>수정
        </button>
      </div>
    </div>

    <template v-if="!isManager">
      <div class="child-info">
        <template v-if="userType === 'STUDENT'">
          <label id="child-name">반 번호</label>
          <input name="child-name" id="child-name" disabled v-model="memberClassNumber" />
        </template>

        <template v-else-if="userType === 'PARENTS'">
            <label>자녀 이름</label>
            <input disabled v-model="memberChildName" />
        </template>
      </div>
    </template>
    <ProfileSettingModal v-if="isProfileSetting"
      :mode="'edit'"
      :userInfoName="memberChildName"
      :path="'class'"
      :profileId="profileId"
      :classId="classId" 
      @closeProfileSettingModal="closeProfileSettingModal" 
    />
  </div>
</template>

<script>
import {mapState, mapMutations} from "vuex";
import ProfileSettingModal from '@/components/Profile/ProfileSettingModal.vue';

export default {
  name: 'main-body-clazzes-body-setting-my-profile',
  components: {
    ProfileSettingModal
  },
  props: {
    isManager: Boolean
  },
  computed: {
    ...mapState({
      curClassItem: 'curClassItem'
    }),
    ...mapState('storeClazzes', {
      classUser: 'classUser'
    }),
    userPhoto() {
      let defaultImage = '/files/img/profile_default.png'
      if(!this.classUser.userPhoto) {
        return defaultImage
      }
      return this.classUser.userPhoto 
    },
    isClassOwner() {
      return this.curClassItem.classOwner.currentId === this.classUser.userId
    },
    userType() {
      // return this.$store.state.user.userType
      return this.classUser.userType
    },
    classId() {
      return this.curClassItem.currentId
    },
    memberChildName() {
      return this.classUser.memberChildName
    },
    memberClassNumber() {
      return this.classUser.memberClassNumber
    }
  },
  data() {
    return {
      isProfileSetting: false,
      profileId: null
    }
  },
  methods: {
    ...mapMutations('storeClazzes', {
      setClassUser: 'setClassUser'
    }),
    openProfileSettingModal() {
      this.profileId = this.classUser.profileId
      this.isProfileSetting = true
    },
    closeProfileSettingModal() {
      this.isProfileSetting = false
    },
    async checkProfileChange() {
      await this.$hiClass
        .getAcceptSubscribeClassByClassIdAndUserId(this, this.classId)
        .then(clazzSubscribeViews => {
          const clazzSubscribeView = clazzSubscribeViews[0]
          this.setClassUser({
            ...this.classUser,
            memberChildName: clazzSubscribeView.memberChildName,
            profileId: clazzSubscribeView.profileId,
            userName: clazzSubscribeView.userName,
            userPhoto: clazzSubscribeView.userPhoto
          })
        })
    }
  },
  mounted() {
    if(this.classUser.userType === "STUDENT") {
      this.checkProfileChange()
    }
  }
}
</script>
<style scoped lang="scss">
.avatar-img.lg{
  width:66px;
  height:66px;
  min-width: 66px;
  min-height: 66px;
}
</style>