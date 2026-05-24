<!--
@File(Method): MainBodyClazzesBody.vue
@Author: -
@Date Created: -
@Description: 클래스 메인 컨텐츠 영역
@Modified: 2024-12-26 - #69560 구성원 관리 태그 추가 : 구성원관리 페이지 rnb 비활성화
-->
<template>
  <div
    v-infinite-scroll="getSearchList"
    :infinite-scroll-disabled="infiniteScrollDisabled"
    :infinite-scroll-distance="infiniteScrollDistance"
    class="column-content"
    :class="{
      'column-full': isDisabledRnb
      // 'column-full': isUseInfiniteScrollForm || curForm === 'SURVEY'
    }"
  >
    
    <main-body-clazzes-body-class-board
      v-if="isShowClassBoard && !refreshFlag"
      :key="`${curForm}-${curFormRefreshCount}`"
      :cur-form="curForm"
      :is-manager="isManager"
    />

    <main-body-clazzes-body-class-management
      v-else-if="isShowClassManagement && !refreshFlag"
      :key="`${curForm}-${curFormRefreshCount}`"
      :cur-form="curForm"
      :isManager="isManager"
      :isClassActivated="isClassActivated"

      :clazzes="clazzes"
      :clazzMemberRole="clazzMemberRole"
      :clazzSubscribesUri="clazzSubscribesUri"
      :userUri="userUri"

      :isInitComp="isInitComp"
      :is-busy="isBusy"
    />

    <main-body-clazzes-body-manage-class
      v-else-if="isShowManageClass && !refreshFlag"
      :key="`${curForm}-${curFormRefreshCount}`"
      :cur-form="curForm"
      :isManager="isManager"
      :isClassActivated="isClassActivated"

      :clazzes="clazzes"
      :clazzMemberRole="clazzMemberRole"
      :clazzSubscribesUri="clazzSubscribesUri"
      :userUri="userUri"

      :isInitComp="isInitComp"
      :is-busy="isBusy"
    />

  </div>
</template>

<script>
import MainBodyClazzesBodyClassBoard from "@/apps/main/clazzes/MainBodyClazzesBodyClassBoard";
import MainBodyClazzesBodyClassManagement from "@/apps/main/clazzes/MainBodyClazzesBodyClassManagement.vue";
import MainBodyClazzesBodyManageClass from "@/apps/main/clazzes/MainBodyClazzesBodyManageClass.vue";

import {eventBus} from '@/main'
import {mapGetters, mapState} from "vuex";

export default {
  name: 'main-body-clazzes-body',
  components: {
    MainBodyClazzesBodyClassManagement,
    MainBodyClazzesBodyManageClass,
    MainBodyClazzesBodyClassBoard,
  },
  props: [
    'curForm',
    'isManager',
    'isClassActivated',

    'clazzes',
    'clazzMemberRole',
    'clazzSubscribesUri',
    'userUri',

    'isInitComp',
    'isBusy',
    'searchKeyword'
  ],
  data() {
    return {
      refreshFlag: false,
      curFormRefreshCount: 0,
    }
  },
  computed: {
    ...mapState({
      curClassTabCode: 'curClassTabCode',
      infiniteScroll: 'infiniteScroll',
      user: 'user'
    }),
    ...mapGetters('storeBoard', {
      curBoard: 'curBoard'
    }),
    isExceptForm() {
      return this.curForm
        && !this.isShowClassBoard
        && !this.isShowClassManagement
        && !this.isShowManageClass
    },
    isShowClassBoard() {
      return [
        'ALL',
        'NOTE',
        'ALBUM',
        'BOARD',
        'HOMEWORK'
      ].includes(this.curForm)
    },
    isShowClassManagement() {
      return [
        'ATTENDANCE',
        'SURVEY',
        'FORM',
        'CLASS',
      ].includes(this.curForm)
    },
    isShowManageClass() {
      return [
        'SETTING',
        'PERMISSION',
        'MEMBER',
        'INVITE'
      ].includes(this.curForm)
    },
    isDisabledRnb() {
      return this.curForm === 'FORM' || this.curForm === 'SURVEY' || this.curForm === 'ATTENDANCE' || this.curForm === 'MEMBER' //#69560 구성원 관리 태그 추가 : 구성원관리 페이지 rnb 비활성화
    },
    isUseInfiniteScrollPostFiles() {
      return this.curClassTabCode === 'FILE'
    },
    curBoardUsed() {
      return this.curBoard.boardStatus === 'ACTIVATE'
    },
    curUserUsed() {
      return (
        this.isManager ||
        (this.curUserParents && this.curBoard.isReadParents) ||
        (this.curUserStudent && this.curBoard.isReadStudent) ||
        ((this.curBoard.boardPermission || {}).isReadable || false)
      )
    },
    curUserParents() {
      return !this.isManager &&
        (this.user.userType === 'TEACHER' || this.user.userType === 'PARENTS')
    },
    curUserStudent() {
      return !this.isManager && this.user.userType === 'STUDENT'
    },
    infiniteScrollDisabled() {
      return this.isDisabledRnb || this.isUseInfiniteScrollPostFiles
        ? this.infiniteScroll.isBusy
        : false
    },
    infiniteScrollDistance() {
      return this.infiniteScroll.distance
    }
  },
  watch: {},
  async mounted() {
    this.$nextTick(async () => {
      /**
       * 허용되지 않은 메뉴 타입인 경우 메인 홈으로 이동
       */
      if (this.isExceptForm) {
        this.$hiClass.alert('잘못된 요청입니다.')
        this.$router.push('/main', () => {})
        return false
      }

      if (this.curForm !== 'ALL' && this.isShowClassBoard) {
        try {
          await this.checkCurBoardUsedAndCurUserUsed()
        } catch (e) {
          this.$log.debug(this.$options.name, e)
          this.$toasted.clear()

          if (this.curBoard && !this.curBoard.boardId) {
            const classId = this.clazzes.currentId
            this.$router.replace(`/main/clazzes/${classId}/`, () => {})
          } else {
            // 게시판 사용 금지 설정 or 권한이 없는 사용자 main 으로 이동 처리
            this.$toasted.show('사용 중지된 게시판이거나 읽기 권한이 없습니다.')
            this.$router.push('/main', () => {})
          }

        }
      }
    })

    eventBus.$on('increase-cur-form-refresh-count', () => {
      this.refreshFlag = true
      this.curFormRefreshCount++
      this.$nextTick(() => this.refreshFlag = false)
    })
  },
  beforeDestroy() {
    eventBus.$off('increase-cur-form-refresh-count')
  },
  methods: {
    /**
     * 클래스 게시판 사용 여부 및 읽기 권한 체크
     */
    checkCurBoardUsedAndCurUserUsed() {
      return new Promise((resolve, reject) => {
        this.curBoardUsed && this.curUserUsed
          ? resolve(true)
          : reject(`not allowed. call checkCurBoardUsedAndCurUserUsed()`)
      })
    },
    getSearchList() {
      if (!this.infiniteScroll.isBusy
        && !this.infiniteScroll.isListEnd
        && this.infiniteScroll.page > 0
      ) {
        this.$log.debug(
          this.curForm,
          'this.infiniteScroll.isBusy => ',
          this.infiniteScroll.isBusy,
          'this.infiniteScroll.isListEnd => ',
          this.infiniteScroll.isListEnd
        )
        // get form list
        eventBus.$emit('do-search-resource', false)

        if (this.isUseInfiniteScrollPostFiles) {
          // get post files
          eventBus.$emit('get-cur-post-files')
        }
      }
    },
  }
}
</script>

<style scoped></style>
