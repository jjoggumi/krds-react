<template>
  <!-- 게시판 설정 -->
  <div v-if="clazzes.currentId" class="setting-category-wrap category-board">
    <div class="category-title">게시판 설정</div>

    <!-- 신청서 관리 기능 설정 -->
    <main-body-clazzes-body-permission-board-setting-item
      :key="'apply'"
      :clazzes="clazzes"
      :isManager="isManager"
      :isClassActivated="isClassActivated"
      :type="{
        code: 'apply',
        name: '학교 양식'
      }"
    />
    <br />

    <!-- 출석부 기능 설정 -->
    <main-body-clazzes-body-permission-board-setting-item
      v-if="!isExpired({ expiredTime: attendanceExpiredTime })"
      :key="'attendance'"
      :clazzes="clazzes"
      :isManager="isManager"
      :isClassActivated="isClassActivated"
      :type="{
        code: 'attendance',
        name: '출석부'
      }"
    />
    <br />

    <!-- 알림장 기능 설정 -->
    <main-body-clazzes-body-permission-board-setting-item
      :key="'note'"
      :clazzes="clazzes"
      :isManager="isManager"
      :isClassActivated="isClassActivated"
      :type="{
        code: 'note',
        name: postTypeName
      }"
    />
    <br />

    <!-- 앨범 기능 설정 -->
    <main-body-clazzes-body-permission-board-setting-item
      :key="'album'"
      :clazzes="clazzes"
      :isManager="isManager"
      :isClassActivated="isClassActivated"
      :type="{
        code: 'album',
        name: '앨범'
      }"
    />
    <br />

    <!-- 자유게시판 기능 설정 -->
    <main-body-clazzes-body-permission-board-setting-item
      :key="'board'"
      :clazzes="clazzes"
      :isManager="isManager"
      :isClassActivated="isClassActivated"
      :type="{
        code: 'board',
        name: '자유'
      }"
    />
    <br />

    <!-- 과제 기능 설정 -->
    <main-body-clazzes-body-permission-board-setting-item
      :key="'homework'"
      :clazzes="clazzes"
      :isManager="isManager"
      :isClassActivated="isClassActivated"
      :type="{
        code: 'homework',
        name: '과제'
      }"
    />

    <!-- 클래스 세팅 참고 문구 -->
    <div class="des-list" v-html="classSettingDescription"></div>

  </div>
  <!-- //게시판 설정 -->
</template>

<script>
import MainBodyClazzesBodyPermissionBoardSettingItem from '@/apps/main/clazzes/permission/MainBodyClazzesBodyPermissionBoardSettingItem.vue'
import {mapGetters, mapState} from "vuex";

export default {
  name: 'main-body-clazzes-body-permission-board-setting',
  components: {
    MainBodyClazzesBodyPermissionBoardSettingItem
  },
  props: {
    clazzes: Object,
    isManager: Boolean,
    isClassActivated: Boolean
  },
  data() {
    return {}
  },
  computed: {
    ...mapState({
      attendanceExpiredTime: 'attendanceExpiredTime',
    }),
    ...mapGetters({
      getPostTypeNameByCode: "getPostTypeNameByCode",
      isExpired: 'isExpired',
    }),
    postTypeName() {
      return this.getPostTypeNameByCode({
        code: 'NOTE',
        type: this.clazzes.schoolType
      })
    },
    classSettingDescription() {
      let classSettingDescription = ''
      const descriptions = [
        '<li>- 게시판 사용 : 게시판 사용을 OFF하면 클래스 게시판 탭 보이지 않고, 기존 게시물 접근이 불가합니다.</li>',
        '<li>- 읽기 권한 : 권한을 부여받은 구성원에게만 게시글이 보입니다. 이후 권한을 부여하여도, 이전 게시물의 읽기 권한이 없었다면 해당 게시물을 열람할 수 없습니다.</li>',
        '<li>- 글쓰기 권한 : 권한을 부여 받은 구성원만 게시글 작성이 가능합니다.</li>',
        '<li>- 댓글 사용 : 게시판에 댓글 사용 시 게시글 하단에 댓글창이 표시됩니다.</li>',
        '<li>- 댓글쓰기 권한 : 권한을 부여 받은 구성원만 해당 게시판 댓글 확인 및 작성할 수 있습니다.</li>',
        '<li>- 좋아요 사용 : 게시판에 좋아요 사용 시 게시글 하단에 좋아요 버튼이 표시됩니다.</li>',
      ]
      for (const description of descriptions)
        classSettingDescription += description

      return classSettingDescription
    }
  },
  methods: {},
  created: function() {}
}
</script>
