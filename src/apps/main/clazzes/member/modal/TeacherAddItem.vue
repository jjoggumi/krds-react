<!--
@File(Method): TeacherAddItem.vue
@Date Created: 2025-01-09
@Description: 클래스 구성원 관리 > 선생님 > 선생님 추가 모달 (선생님 검색결과)
@Modify: #69538 클래스 생성 시 유치, 중고등 분류
-->
<template>
  <li @click="selectTeacher" :class="{'selected': isSelected}">
    <div class="inner">
      <div class="profile-img-wrap" :style="userPhotoStyleObj"></div>
      <div class="profile-name-wrap">
        <div class="teacher-name">{{ `${teacher.userName} ${$t('teacher')}` }}</div>
      </div>
    </div>
  </li>
</template>

<script>
export default {
  name: 'teacher-add-item',
  props: {
    teacher: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    userPhotoStyleObj() {
      let imagePath = this.teacher.userPhoto ? this.teacher.userPhoto : '/files/img/profile_default.png'
      return `background-image:url('${imagePath}'); background-size: 66px 66px`
    }
  },
  methods: {
    selectTeacher() {
      this.$emit('selectUser', this.index)
    }
  }
}
</script>

<style lang="scss" scoped>
li {
  padding:0 30px;
  &:hover {cursor:pointer;}
  &.selected {background:#ecf3ff;cursor:pointer;}
  &:last-child .inner {border:0;}
  .inner {padding:20px 0;border-bottom:1px solid rgba(0,0,0,0.1);font-size:0;text-align:left;}
  .inner > * {display:inline-block;vertical-align:middle;}
  .profile-img-wrap {
    width:66px;height:66px;margin:0 20px 0 0 ;border-radius:50%;background: url(~@/assets/img/logo_school2.png) center no-repeat;background-size: cover !important;
  }
  .profile-name-wrap{
    .teacher-name {font-size: 16px;font-weight:500;color: #2e2e2e;}
    .school-name {margin:6px 0 0 0;font-size: 14px;color: #2e2e2e;}
  }
}

</style>
