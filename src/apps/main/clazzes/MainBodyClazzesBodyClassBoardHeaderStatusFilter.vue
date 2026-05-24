<template>
  <!-- 게시글 상태 필터 -->
  <div class="board__filter"> <!-- .selete-view-style-wrap -->
    <div class="group-filter-sub">
      <button
        v-for="(filter, index) of filterList"
        :key="`${filter.code}-${index}`"
        :class="{
          'is-active': isActiveByFilter(filter)
        }"
        @click="selectFilter(filter)"
      >
        {{ filter.name }}
      </button>
    </div>
  </div>
</template>

<script>
import {mapGetters, mapMutations, mapState} from "vuex";
import {eventBus} from "@/main";

export default {
  name: "main-body-clazzes-body-class-board-header-status-filter",
  props: {
    curForm: {
      type: String,
      required: true
    },
    isManager: {
      type: Boolean
    }
  },
  data() {
    return {

    }
  },
  computed: {
    ...mapState({
      curClassSearchQuery: 'curClassSearchQuery'
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    curTabCode() {
      let curTabCode
      switch (this.curForm) {
        case this.CONSTANTS.POST_TYPE.NOTE:
        case this.CONSTANTS.POST_TYPE.ALBUM:
        case this.CONSTANTS.POST_TYPE.BOARD: {
          curTabCode = this.curClassSearchQuery.postStatus
          break
        }
        case this.CONSTANTS.POST_TYPE.HOMEWORK: {
          if (this.isManager) {
            curTabCode = this.curClassSearchQuery.postStatus
          } else {
            curTabCode = this.curClassSearchQuery.homeworkType
          }
          break
        }
      }
      return curTabCode
    },
    filterList() {
      const filterList = []
      switch (this.curForm) {
        case this.CONSTANTS.POST_TYPE.NOTE:
        case this.CONSTANTS.POST_TYPE.ALBUM:
        case this.CONSTANTS.POST_TYPE.BOARD: {
          filterList.push(...this.noteFilterList)
          break
        }
        case this.CONSTANTS.POST_TYPE.HOMEWORK: {
          if (this.isManager) {
            filterList.push(...this.noteFilterList)
          } else {
            filterList.push(...this.homeworkFilterList)
          }
          break
        }
      }
      return filterList
    },
    noteFilterList() {
      const noteFilterList = [
        {
          code: this.CONSTANTS.POST_STATUS.ALL,
          name: '전체',
        },
        {
          code: this.CONSTANTS.POST_STATUS.COMPLETE,
          name: '발송완료',
        },
        {
          code: this.CONSTANTS.POST_STATUS.TEMPORARY,
          name: '임시저장',
        },
        {
          code: this.CONSTANTS.POST_STATUS.RESERVE,
          name: '예약',
        }
      ]
      noteFilterList.forEach(filter => filter.type = 'postStatus')
      return noteFilterList
    },
    homeworkFilterList() {
      const homeworkFilterList = [
        {
          code: this.CONSTANTS.POST_HOMEWORK_TYPE.ALL,
          name: '전체',
        },
        {
          code: this.CONSTANTS.POST_HOMEWORK_TYPE.NOT_SUBMIT,
          name: '미제출',
        },
        {
          code: this.CONSTANTS.POST_HOMEWORK_TYPE.SUBMIT,
          name: '제출완료',
        },
      ]
      homeworkFilterList.forEach(filter => filter.type = 'homeworkType')
      return homeworkFilterList
    },
  },
  methods: {
    ...mapMutations({
      setCurClassSearchQueryAttr: 'setCurClassSearchQueryAttr'
    }),
    isActiveByFilter(filter) {
      return filter.code === this.curTabCode
        || (
          filter.code === this.CONSTANTS.POST_STATUS.ALL
          && this.curTabCode === null
        )
    },
    selectFilter(filter) {
      const payload = {
        [filter.type]: filter.code
      }
      this.setCurClassSearchQueryAttr(payload)

      // 게시글 목록만 초기화
      eventBus.$emit('refresh-class-board-posts')

      // 게시글 header, body 모두 초기화
      // eventBus.$emit('refresh-cur-form')
    },
  }
}
</script>

<style scoped>

</style>