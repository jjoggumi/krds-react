<!--
@File(Method): PostHomeworkUserList.vue
@Author: -
@Date Created: -
@Description: 게시판 > 과제 > 과제제출현황 > 과제제출현황 팝업
@Modified: 2025-01-09 - #69560 구성원 관리 태그 추가 - 검색영역 태그, 필터 추가 
-->
<template>
  <div class="member-status__list">
    <div class="group-filter">
      <div>제출: <span class="num">{{ submittedCount }}</span>/{{ postHomeworkUsers.length || 0 }}명</div>
      <div class="checkbox">
        <input type="checkbox" id="filter00" v-model="sortSubmit">
        <label for="filter00"><span class="f">제출순</span></label>
      </div>
    </div>
    <MemberSearch :clazzTags="clazzTags" @search="search"/>
    <div class="member-status__item-wrap custom-scr">
      <div
        v-for="(postHomeworkUser, index) of sortedPostHomeworkUsers"
        :key="`${postHomeworkUser.writeUser.userId}-${index}`"
        class="member-status__item"
        :class="{ 'is-active': isActive(postHomeworkUser) }"
        role="button"
        @click="$emit('set-selected-item', postHomeworkUser)"
      >
        <div class="member-info">
          <span class="image">
            <!-- <img
              v-if="postHomeworkUser.writeUser.userPhoto"
              :src="postHomeworkUser.writeUser.userPhoto"
              @error="userPhotoReplace(postHomeworkUser.writeUser)"
              alt=""
            > -->

            <img
              :src="userPhoto(postHomeworkUser.writeUser)"
              @error="userPhotoReplace"
              alt=""
            >
          </span>
          <span 
            v-if="postHomeworkUser.writeUser.memberClassNumber !== 999"
            :class="sortedKind(postHomeworkUser.writeUser.memberClassNumber, postHomeworkUser.writeUser.userType)"
          >
            {{ postHomeworkUser.writeUser.memberClassNumber }}
          </span>
          <span class="name">{{ getUserNameStr(postHomeworkUser.writeUser) }}</span>
        </div>

        <span
          class="status"
          :class="{
            complete: isSubmit(postHomeworkUser)
          }"
        >
          {{ getSendDateToStr(postHomeworkUser) }}
        </span>
      </div>     
      <div class="hi-nodata" v-if="sortedPostHomeworkUsers.length === 0">
        <p v-if="postHomeworkUsers.length === 0">
        구성원이 없습니다.
        </p>
        <p v-else>
        검색결과가 없습니다.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapState} from "vuex";
import {URLProps} from "@/enums";
import MemberSearch from "@/components/Search/MemberSearch";

export default {
  name: "post-homework-user-list",
  data() {
    return {
      memberSearchItem: {
        searchType: 'NONE',
        searchValue: ''
      }
    }
  },
  props: {
    postHomeworkUsers: {
      type: Array
    },
    checkboxSubmit: {
      type: Boolean,
    },
    selectedItem: {
      type: Object
    },
    classId: {
      type: String
    }
  },
  components: {
    MemberSearch
  },
  computed: {
    ...mapState('storeClazzTag', [
      'clazzTags'
    ]),
    ...mapGetters({
      getUserNameByWriteUserHomeWork: 'getUserNameByWriteUserHomeWork',
    }),
    submittedCount() {
      return this.postHomeworkUsers.filter(u => u.workId).length
    },
    sortSubmit: {
      get() {
        return this.checkboxSubmit
      },
      set(val) {
        this.$emit('update:checkboxSubmit', val)
      }
    },
    sortedPostHomeworkUsers() {
      let sortedPostHomeworkUsers = []

      if (this.sortSubmit) {
        try {
          const list = {
            submit: this.postHomeworkUsers.filter(d => d.workId),
            notSubmit: this.postHomeworkUsers.filter(d => !d.workId)
          }

          this.arrayInObjectSort({
            array: list.submit,
            sortingTargets: [
              'insertedTimestamp,desc',
            ]
          })

          for (let listType of ['submit', 'notSubmit']) {
            sortedPostHomeworkUsers.push(...this.editPostHomeworkUsers(list[listType], listType === 'submit'))
          }
        } catch (e) {
          sortedPostHomeworkUsers = this.postHomeworkUsers
        }
      } else {
        sortedPostHomeworkUsers = this.editPostHomeworkUsers(this.postHomeworkUsers, false)
      }

      if (this.memberSearchItem.searchType === 'KEYWORD') {
        return sortedPostHomeworkUsers.filter(u =>
            (u.writeUser.userName || '').includes(this.memberSearchItem.searchValue) ||
            (u.writeUser.memberChildName || '').includes(this.memberSearchItem.searchValue)
        )

      } else if (this.memberSearchItem.searchType === 'TAG') {
        return sortedPostHomeworkUsers.filter(u => (u.tags || []).map(t => t.tagId).includes(this.memberSearchItem.searchValue))

      } else if (this.memberSearchItem.searchType === 'TAG_MULTI') {
        return this.memberSearchItem.searchValue.length > 0 ?
            sortedPostHomeworkUsers.filter(u => this.memberSearchItem.searchValue
                .some(tagId => (u.tags || []).map(t => t.tagId).includes(tagId))
            ) :
            sortedPostHomeworkUsers

      } else {
        return sortedPostHomeworkUsers
      }
    },
  },
  mounted() {
    // 과제 최근 제출 순 정렬
    this.sortSubmit = true
    this.fetchTags(this.classId)
  },
  methods: {
    ...mapActions({
      arrayInObjectSort: 'arrayInObjectSort',
    }),
    ...mapActions('storeClazzTag', [
      'fetchTags'
    ]),
    editPostHomeworkUsers(list, sortByTimestamp) {
      return [
        ...['STUDENT', 'PARENTS', null].flatMap(type => {
          return list
              .filter(v => v.writeUser.userType === type)
              .map(u => {
                if (type !== 'STUDENT' && !u.writeUser.memberClassNumber) {
                  u.writeUser.memberClassNumber = 999
                }
                return u
              } )
              .sort((a, b) => {
                return sortByTimestamp ?
                    a.insertedTimestamp - b.insertedTimestamp :
                    type === 'PARENTS' ? a.writeUser.memberClassNumber - b.writeUser.memberClassNumber : false
              })
        })
      ]
    },
    isSubmit(postHomeworkUser) {
      return !!(postHomeworkUser.updatedTimestamp || postHomeworkUser.insertedTimestamp)
    },
    isActive(postHomeworkUser) {
      if (!this.selectedItem.writeUser) return false

      return postHomeworkUser.writeUser.userId === this.selectedItem.writeUser.userId
    },
    getUserNameStr(writeUser) {
      return this.getUserNameByWriteUserHomeWork({ writeUser, isClassPost: true })
    },
    getSendDateToStr(postHomeworkUser) {
      const timestamp = postHomeworkUser.updatedTimestamp || postHomeworkUser.insertedTimestamp
      // 'M월 D일 (ddd) H시 m분' : 24시간으로 표시
      return timestamp ? this.$moment(timestamp).format('MM.DD HH:mm') : '미제출'
    },
    sortedKind(number, type) {
      if(number === 999) {
        return "num-no"
      }

      if(type === "PARENTS") {
        return "num"
      }
      
      return "num-std"
    },
    userPhoto(item) {
      return item.userPhoto || URLProps.DEFAULT_PROFILE_IMAGE_URL
    },
    userPhotoReplace(e) {
      e.target.src = URLProps.DEFAULT_PROFILE_IMAGE_URL
    },
    search({ searchType, searchValue }) {
      this.memberSearchItem = { searchType, searchValue }
    }
  }
}
</script>

<style lang="scss" scoped>
.member-search{
  border-top: 1px solid #e0e0e0;
}
.hi-nodata{padding:250px 0;}
</style>