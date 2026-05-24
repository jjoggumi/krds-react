<!--
@File(Method): MainBodyClazzesBodySetting.vue
@Description: 클래스 > 클래스 관리 > 클래스 설정
@Modified: 2025-02-03 - #69560 클래스 구성원 관리 태그 추가 , 구성원관리에 선생님 목록 이동
-->
<template>
  <div v-if="clazzes.currentId" >
    <div class="class-setting-wrap">
      <template v-if="isManager">
        <div class="page-sub-heading" style="min-height: auto;">
          <h3 class="heading">클래스 설정</h3>
        </div>

        <div class="board__filter">
          <div class="group-filter-sub">
            <button :class="{
              'is-active' : tabOn === 'info'
            }" @click="onMoveTab('info')">클래스 정보</button>
            <button :class="{
              'is-active' : tabOn === 'profile'
            }" @click="onMoveTab('profile')">내 프로필 관리</button>
            <!-- #69538  탭추가 -->
            <button :class="{
              'is-active' : tabOn === 'private'
            }" @click="onMoveTab('private')">클래스 비공개 / 삭제</button>
          </div>
        </div>

        <template v-if="tabOn === 'info'">
          <!-- 클래스 정보 -->
          <MainBodyClazzesBodySettingClassInfo
            key="clazz-setting-class-info"
            :clazzes="clazzes"
            :isManager="isManager"
            :isClassActivated="isClassActivated"
            @openChangeMemberRole="isShowChangeMemberRole = true"
            ref="settingClassInfo"
          ></MainBodyClazzesBodySettingClassInfo>
          <!-- // 클래스 정보 -->
          
        </template>
        <template v-if="tabOn === 'profile'">
          <MainBodyClazzesBodySettingMyProfile :isManager="isManager"></MainBodyClazzesBodySettingMyProfile>
          <!-- 클래스 구독자 상세 정보 / 클래스 탈퇴 -->
          <MainBodyClazzesBodySettingClassUnsubscribe
            :clazzes="clazzes"
            :clazzMemberRole="clazzMemberRole"
            :clazzSubscribesUri="clazzSubscribesUri"
            :user="userUri"
            :isManager="isManager"
          ></MainBodyClazzesBodySettingClassUnsubscribe>
          <!-- // 클래스 구독자 상세 정보 / 클래스 탈퇴 -->
        </template>
        <template v-if="tabOn === 'private'">
         <!-- 클래스 비공개/삭제 -->
         <MainBodyClazzesBodySettingClassDeactivate
            :clazzes="clazzes"
            :clazzMemberRole="clazzMemberRole"
            :isManager="isManager"
          ></MainBodyClazzesBodySettingClassDeactivate>
          <!-- // 클래스 비공개/삭제 -->
        </template>
      </template>

      <template v-else>
        <div class="page-sub-heading" style="min-height: auto;">
          <h3 class="heading">클래스 정보</h3>
        </div>
        <MainBodyClazzesBodySettingMyProfile :isManager="isManager"></MainBodyClazzesBodySettingMyProfile>
        <!-- 클래스 구독자 상세 정보 / 클래스 탈퇴 -->
        <MainBodyClazzesBodySettingClassUnsubscribe
          :clazzes="clazzes"
          :clazzMemberRole="clazzMemberRole"
          :clazzSubscribesUri="clazzSubscribesUri"
          :user="userUri"
          :isManager="isManager"
        ></MainBodyClazzesBodySettingClassUnsubscribe>
        <!-- // 클래스 구독자 상세 정보 / 클래스 탈퇴 -->
      </template>
    </div>
  </div>
</template>

<script>
import MainBodyClazzesBodySettingClassDeactivate from './MainBodyClazzesBodySettingClassDeactivate.vue'
import MainBodyClazzesBodySettingClassInfo from './MainBodyClazzesBodySettingClassInfo.vue'
import MainBodyClazzesBodySettingClassUnsubscribe from './MainBodyClazzesBodySettingClassUnsubscribe.vue'
import MainBodyClazzesBodySettingMyProfile from './MainBodyClazzesBodySettingMyProfile'

export default {
  name: 'mainBodyClazzesBodySetting',
  components: {
    MainBodyClazzesBodySettingClassDeactivate,
    MainBodyClazzesBodySettingClassInfo,
    MainBodyClazzesBodySettingClassUnsubscribe,
    MainBodyClazzesBodySettingMyProfile
  },
  props: {
    isManager: Boolean,
    isClassActivated: Boolean,
    clazzMemberRole: String,
    clazzSubscribesUri: String,
    clazzes: Object,
    userUri: Object,
  },
  data: () => ({
    classManager: [],
    isShowChangeMemberRole: false,
    tabOn: "info"
  }),
  async created() {
    /**
     * 클래스 세팅이 외부 요인으로 변경되었을 경우 갱신함
     * @type {*}
     */
    const clazz = await (
      this.$hiClass.clazzes.read(`/clazzes/${this.clazzes.currentId}`)
        .then(res => res.data || {})
    )
    
    for(const [key, value] of Object.entries(clazz))
      this.clazzes[key] = value
  },
  methods: {
    onMoveTab(data) {
      this.tabOn = data
    }
  }
}
</script>

<style scoped></style>
