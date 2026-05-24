<template>
  <div class="box-deadline">
    <div class="deadline">
      <strong class="heading"><i class="icon-homework"></i>제출기한 : </strong>
      <span>{{ timestampEndToStr }}</span>
    </div>

    <button
      v-if="isShowHomeworkSubmitButton"
      class="hi-btn btn-sm"
      :class="{ 'btn-line': isHomeworkSubmit }"
      @click="onClickSubmit"
    >
      {{ homeworkSubmitStr }}
    </button>

    <!-- OLD 학생/학부모 과제 제출/수정 모달-->
    <main-body-clazzes-body-homework-status-member-modify
      v-if="option.isModify"
      :mode="option.mode"
      :post="postItem"
      :workId="postHomeworkUser.workId"
      @handleModify="handleModify"
      @is-complete="doSubmit"
      @is-fail="failUpload"
    />

    <!-- OLD 학생/학부모 과제 VIEW 모달-->
    <main-body-clazzes-body-homework-status-member-view
      v-if="option.isView"
      :isManager="isManager"
      :workId="postHomeworkUser.workId"
      :board="postItem.board"
      @handleModify="handleModify"
      @is-complete="doSubmit"
      @handleView="handleView"
    >
      <template v-slot:className>
        {{ className }}
      </template>
    </main-body-clazzes-body-homework-status-member-view>
  </div>
</template>

<script>
import {mapGetters, mapMutations} from "vuex";
import MainBodyClazzesBodyHomeworkStatusMemberView
  from "@/apps/main/clazzes/homework/status/MainBodyClazzesBodyHomeworkStatusMemberView";
import MainBodyClazzesBodyHomeworkStatusMemberModify
  from "@/apps/main/clazzes/homework/status/MainBodyClazzesBodyHomeworkStatusMemberModify";
import {eventBus} from "@/main";

export default {
  name: "post-homework-status",
  components: {MainBodyClazzesBodyHomeworkStatusMemberModify, MainBodyClazzesBodyHomeworkStatusMemberView},
  props: {
    isManager: {
      type: Boolean,
      required: true
    },
    /**
     * props: post item object
     * ( post | clazzesPost | schoolsPost )
     */
    postItem: {
      type: Object,
      required: true
    },
    /**
     * props: post item type
     * ( POST | CLAZZES_POST | SCHOOLS_POST )
     */
    postItemType: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      option: {
        isFailUpload: false,
        isModify: false,
        isView: false,
        mode: null,
      },
      postHomeworkUser: {},
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
      isAvailableClazzHomeworkSubmit: 'isAvailableClazzHomeworkSubmit',
    }),
    isShowHomeworkSubmitButton() {
      return this.isPostStatusComplete
        && !this.isExportedPostByTkBell
        && this.isGrantedMemberByHomework
    },
    isExportedPostByTkBell() {
      return this.postItem.letterType === 'TKBELL'
    },
    isPostStatusComplete() {
      return this.postItem.postStatus === this.CONSTANTS.POST_STATUS.COMPLETE
    },
    isHomeworkSubmit() {
      return this.postItem.homeworkType === this.CONSTANTS.POST_HOMEWORK_TYPE.SUBMIT
    },
    isHomeworkNotSubmit() {
      return this.postItem.homeworkType === this.CONSTANTS.POST_HOMEWORK_TYPE.NOT_SUBMIT
    },
    isGrantedMemberByHomework() {
      const isManager = this.isManager
      const isSubmitMember = this.isHomeworkSubmit
      const isNotSubmitMember = this.isHomeworkNotSubmit
      const isAvailableClazzHomeworkSubmit =
        this.isAvailableClazzHomeworkSubmit({ board: this.postItem.board })

      this.$log.debug(
        'isManager || isSubmitMember || ( isNotSubmitMember && isAvailableClazzHomeworkSubmit ) :'
        , isManager
        , isSubmitMember
        , '(' , isNotSubmitMember , isAvailableClazzHomeworkSubmit , ')'
      )

      return isManager
        || isSubmitMember
        || (isNotSubmitMember && isAvailableClazzHomeworkSubmit)
    },
    homeworkSubmitStr() {
      let str = ''
      if (this.isManager) return '과제현황보기'

      switch (this.postItem.homeworkType) {
        case this.CONSTANTS.POST_HOMEWORK_TYPE.SUBMIT:
          str = '과제제출완료'
          break
        case this.CONSTANTS.POST_HOMEWORK_TYPE.NOT_SUBMIT:
          str = '과제제출하기'
          break
      }
      return str
    },
    timestampEndToStr() {
      const timestampEnd = this.postItem.timestampEnd

      if (timestampEnd) {
        let dateFormat = 'M월 D일 (ddd) H시 m분'
        const nowYear = this.$moment().year()
        const paramYear = this.$moment(timestampEnd).year()

        if (nowYear - paramYear > 0)
          dateFormat = `YYYY[년] ${dateFormat}`

        return this.$moment(timestampEnd).format(dateFormat) + ' 까지'
      } else {
        return '마감일 없음'
      }
    },
    className() {
      return this.postItem.parent ? this.postItem.parent.className : ''
    },
    postId() {
      return this.postItem.postId || this.postItem.currentId
    },
    classId() {
      return this.postItem.parentId || this.postItem.parent.currentId
    }
  },
  mounted() {
    eventBus.$on(`post-set-homework-type|${this.postId}`, homeworkType => {
      this.setHomeworkType(homeworkType)
    })
  },
  beforeDestroy() {
    eventBus.$off(`post-set-homework-type|${this.postId}`)
  },
  methods: {
    ...mapMutations({
      setCurClazzHomeworkStatus: 'setCurClazzHomeworkStatus',
      setScrollPosition: 'setScrollPosition',
    }),
    onClickSubmit() {
      this.isManager
        ? this.openHomeworkStatusView()
        : this.openHomeworkStatusModal()
    },
    openHomeworkStatusView() {
      // 전체화면 전환 전 현재 스크롤 위치 저장
      this.setScrollPosition(window.pageYOffset)

      // 과제현황 전체화면 전환
      this.setCurClazzHomeworkStatus({
        isOpen: true,
        postItem: this.postItem,
        postItemType: this.postItemType,
      })
    },
    openHomeworkStatusModal() {
      const requestParams = {
        postId: this.postId,
        classId: this.classId
      }
      if (requestParams.postId && requestParams.classId) {
        this.$hiClass.v2.postHomeworkUsers.search(requestParams)
          .then(res => { 
            this.postHomeworkUser = res.data._embedded.postHomeworkUsers[0]

            switch (this.postItem.homeworkType) {
              case this.CONSTANTS.POST_HOMEWORK_TYPE.SUBMIT:
                this.handleView(true)
                // this.$hiClass.alert('TBD: 제출한 과제보기 모달')
                break
              case this.CONSTANTS.POST_HOMEWORK_TYPE.NOT_SUBMIT:
                // this.$hiClass.alert('TBD: 과제제출하기 모달')
                this.handleModify(true, 'create')
                break
            }

          })
      }
    },

    handleModify(bool, mode) {
      this.option.isModify = bool
      if (mode) {
        this.option.mode = mode
      } else {
        this.option.mode = null
      }
    },
    handleView(bool) {
      this.option.isView = bool
    },
    doSubmit() {
      this.postItem.homeworkType = 'SUBMIT'
      eventBus.$emit(`post-set-homework-type|${this.postId}`, 'SUBMIT')
    },
    failUpload() {
      this.option.isFailUpload = true
      this.$hiClass.alert('과제 제출이 완료되지 않았습니다.')
    },
    setHomeworkType(homeworkType) {
      this.postItem.homeworkType = homeworkType
    },

  }
}
</script>

<style scoped>

</style>