<template>
  <div id="wrap" class="l-page-homework">
    <div class="homework__header">
      <div class="homework__inner">
        <h1
          class="heading"
          :inner-html.prop="postTitle"
        ></h1>
        <button
          class="btn-close"
          @click="closeHomeworkStatusView"
        ></button>
      </div>
    </div>

    <div class="homework__content">
      <div class="column-left">

        <post-homework-user-header
          :post-homework-users="postHomeworkUsers"
          :timestamp-end="timestampEnd"
        />

        <post-homework-user-list
          :post-homework-users="postHomeworkUsers"
          :checkbox-submit.sync="option.checkbox.submit"
          :selected-item="selectedItem"
          :classId="parentId"
          @set-selected-item="setSelectedItem"
        />

      </div>

      <div class="column-right">

        <post-homework-user-detail
          v-if="existsSelectedItem"
          :key="`post-homework-user-detail-${selectedItem.writeUser.userId}`"
          :post-homework-users="postHomeworkUsers"
          :selected-item="selectedItem"
        />

        <post-homework-user-not-select
          v-else-if="!existsSelectedItem"
        />

      </div>

    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";

import PostHomeworkUserList from "@/components/FullScreen/postHomeworkStatus/PostHomeworkUserList";
import PostHomeworkUserDetail from "@/components/FullScreen/postHomeworkStatus/PostHomeworkUserDetail";
import PostHomeworkUserHeader from "@/components/FullScreen/postHomeworkStatus/PostHomeworkUserHeader";
import PostHomeworkUserNotSelect from "@/components/FullScreen/postHomeworkStatus/PostHomeworkUserNotSelect";

export default {
  name: "full-screen-post-homework-status",
  components: {PostHomeworkUserNotSelect, PostHomeworkUserHeader, PostHomeworkUserDetail, PostHomeworkUserList},
  data() {
    return {
      option: {
        loading: {
          postHomeworkUsers: false,
        },
        checkbox: {
          submit: false
        }
      },
      postHomeworkUsers: [],
      selectedItem: {},
    }
  },
  computed: {
    ...mapState({
      curClazzHomework: 'curClazzHomework'
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    curClazzHomeworkStatus() {
      return this.curClazzHomework.status
    },
    postItem() {
      return this.curClazzHomeworkStatus.postItem
    },
    postItemType() {
      return this.curClazzHomeworkStatus.postItemType
    },
    postTitle() {
      return this.postItem.postTitle
    },
    parentId() {
      let parentId = ''
      switch (this.postItemType) {
        case this.CONSTANTS.POST_ITEM_TYPE.CLAZZES_POST:
        case this.CONSTANTS.POST_ITEM_TYPE.SCHOOLS_POST: {
          parentId = this.postItem.parentId
          break
        }
        default: { parentId = this.postItem.parent.currentId }
      }
      return parentId
    },
    postId() {
      return this.postItem.postId || this.postItem.currentId || ''
    },
    timestampEnd() {
      return this.postItem.timestampEnd
    },
    existsSelectedItem() {
      return this.selectedItem.writeUser
        ? this.selectedItem.writeUser.userId
        : false
    },
  },
  watch: {
    $route() {
      this.closeHomeworkStatusView()
    }
  },
  created() {
    this.getPostHomeworkUsers()

    // 백그라운드 무한스크롤 중지
    this.setInfiniteScrollIsBusy(true)
  },
  mounted() {
  },
  beforeDestroy() {
    // 백그라운드 무한스크롤 활성화
    this.setInfiniteScrollIsBusy(false)
  },
  destroyed() {
    // 저장된 스크롤 위치 복원
    this.handleScrollPosition()
  },
  methods: {
    ...mapMutations({
      setCurClazzHomeworkStatus: 'setCurClazzHomeworkStatus',
      setInfiniteScrollIsBusy: 'setInfiniteScrollIsBusy',
    }),
    ...mapActions({
      arrayInObjectSort: 'arrayInObjectSort',
      handleScrollPosition: 'handleScrollPosition',
    }),
    closeHomeworkStatusView() {
      this.setCurClazzHomeworkStatus({
        isOpen: false,
        post: {}
      })
    },
    /**
     * 과제 제출 현황 검색
     */
    getPostHomeworkUsers() {
      if (this.option.loading.postHomeworkUsers) return false
      this.option.loading.postHomeworkUsers = true

      let params = {
        postId: this.postId,
        classId: this.parentId,
        size: 500,
      }

      this.$hiClass.v2.postHomeworkUsers
        .search(params)
        .then(res => {
          this.$log.debug(
            this.$options.name + ' getPostHomeworkUsers() res => ',
            res
          )
          this.postHomeworkUsers.splice(0)

          /**
           * d.memberId: 서비스 탈퇴 여부 확인
           * d.writeUser.memberRole: 클래스 탈퇴 여부 확인
           */
          const postHomeworkUsers = res.data._embedded.postHomeworkUsers
          const postHomeworkUsersStudentList = postHomeworkUsers.filter(d =>
            d.memberId && d.writeUser && d.writeUser.memberRole && d.writeUser.userType === 'STUDENT'
          )
          const postHomeworkUsersParentsList = postHomeworkUsers.filter(d =>
            d.memberId && d.writeUser && d.writeUser.memberRole && d.writeUser.userType !== 'STUDENT'
          )
          const postHomeworkUsersUnsubscribeUserList = postHomeworkUsers.filter(d =>
            !d.memberId || !d.writeUser || !d.writeUser.memberRole
          )

          try {
            // 재정렬 (학생)
            this.arrayInObjectSort({
              array: postHomeworkUsersStudentList,
              // 1: 번호 오름차순
              // 2: 마이페이지 이름 오름차순
              sortingTargets: [
                'writeUser.memberClassNumber',
                'writeUser.memberChildName',
              ]
            })

            // 재정렬 (학부모)
            this.arrayInObjectSort({
              array: postHomeworkUsersParentsList,
              // 1: 마이페이지 이름 오름차순
              sortingTargets: [
                'writeUser.memberClassNumber',
                'writeUser.memberChildName',
              ]
            })

          } catch (e) {
            this.$log.warn(e)
          }

          this.postHomeworkUsers.push(...postHomeworkUsersStudentList)
          this.postHomeworkUsers.push(...postHomeworkUsersParentsList)
          this.postHomeworkUsers.push(...postHomeworkUsersUnsubscribeUserList)
        })
        .catch(err => {
          this.$log.debug(
            this.$options.name + ' getPostHomeworkUsers() err => ',
            err
          )
        })
        .finally(() => {
          this.option.loading.postHomeworkUsers = false
          // const foundItem = this.loadCompleteList.find(d => d === 'getPostHomeworkUsers')
          // if (!foundItem)
          //   this.loadCompleteList.push('getPostHomeworkUsers')

          this.$nextTick(() => {
            this.$jqueryUtil.scrollbar()
          })
        })
    },
    setSelectedItem(item) {
      this.selectedItem = {}
      this.$nextTick(() => {
        this.selectedItem = item
      })
    },
  }
}
</script>

<style scoped>

</style>