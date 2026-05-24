<template>
  <article
    :key="`${postId}-${postItemType}-${componentKey}`"
    class="hi-board board__item"
    :id="`board-item-postId-${postId}`"
    :ref="`board-item-postId-${postId}`"
  >
    <card-item-header
      :key="`card-item-header-${componentKey}`"
      :is-parent-activated="isParentActivated"
      :is-parent-deactivated="isParentDeactivated"
      :is-manager="isManager"
      :is-temporary="isTemporary"
      :is-reserve="isReserve"
      :is-write-user="isWriteUser"
      :is-class-list="isClassList"
      :post-id="postId"
      :post-item="postItem"
      :post-must-read="postMustRead"
      :post-title="postTitle"
      :post-type="postType"
      :post-type-name="postTypeName"
      :posted="posted"
      :post-status="postStatus"
      :post-pin.sync="postPin"
      :school-type="schoolType"
      :school-image-path="schoolImagePath"
      :school-name="schoolName"
      :version="version"
      :write-user="writeUser"
      :board="board"
      :folder="folder"
      :is-show-folder-name="isShowFolderName"
      :is-detail="false"
      @movePost="movePost"
      @copyPost="copyPost"
      @is-delete="deletePost"
      @is-post="editPost"
     />

    <post-meal
      v-if="isPostTypeMeal"
      :key="`post-meal-${componentKey}`"
      :post-item="postItem"
      :post-item-type="postItemType"
      :index="index"
    />
    <post-event
      v-else-if="isEvent"
      :key="`post-event-${componentKey}`"
      :post-item="postItem"
      :post-item-type="postItemType"
    />
    <card-item-content
      v-else
      :key="`card-item-content-${componentKey}`"
      :is-parent-activated="isParentActivated"
      :is-manager="isManager"
      :post-item="postItem"
      :post-item-type="postItemType"
      :school-type="schoolType"
      :class-name="className"
      @is-post="editPost"
    />

    <card-item-footer
      :key="`card-item-footer-${componentKey}`"
      :is-parent-activated="isParentActivated"
      :is-manager="isManager"
      :post-item="postItem"
      :post-item-type="postItemType"
      :post-type-name="postTypeName"
      :school-type="schoolType"
      :class-name="className"
      :board="board"
    />

  </article>
</template>

<script>
import {eventBus} from "@/main";
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";

import CardItemHeader from "@/components/Card/CardItemHeader";
import CardItemContent from "@/components/Card/CardItemContent";
import CardItemFooter from "@/components/Card/CardItemFooter";
import PostMeal from "@/components/Card/content/PostMeal";
import PostEvent from "@/components/Card/content/PostEvent";

export default {
  name: 'card-item',
  components: {
    PostEvent,
    PostMeal,
    CardItemFooter,
    CardItemContent,
    CardItemHeader,
  },
  props: {
    // 게시글 상세
    post: {
      type: Object,
      default() {
        return {}
      }
    },
    posts: {
      type: Array,
    },
    // 클래스 목록에서 전달
    clazzesPost: {
      type: Object,
      default() {
        return {}
      }
    },
    clazzesPosts: {
      type: Array
    },
    // 학교 목록에서 전달
    schoolsPost: {
      type: Object,
      default() {
        return {}
      }
    },
    schoolsPosts: {
      type: Array
    },
    index: {
      type: Number,
    },
    param: {
      type: Object,
      default() {
        return {}
      }
    },
    schoolType: {
      type: String,
      required: true
    },
    className: {
      type: String
    },
    isClassList: {
      type: Boolean
    },
    isShowFolderName: {
      type: Boolean
    },
    curForm: {
      type: String,
    },
  },
  data() {
    return {
      cardOption: {
        isManager: false,
        isFooter: true,
        customize: null,
        isReportUse: false,
        isUseFileUpload: false,
        isStatus: false,
        isMypageScrapItem: false
      },
      componentKey: 0,
    }
  },
  computed: {
    ...mapState({
      user: 'user',
      userProfileDefault: 'userProfileDefault',
      curClassItem: 'curClassItem',
      curClazzesPosts: 'curClazzesPosts',
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
      isAvailableClazzHomeworkSubmit: 'isAvailableClazzHomeworkSubmit',
      existsClassManagerByClassId: 'existsClassManagerByClassId',
      getUserTypeNameByCode: 'getUserTypeNameByCode',
      getPostTypeNameByCode: "getPostTypeNameByCode",
    }),
    postItem() {
      if (this.isClazzesPost) {
        return this.clazzesPost
      } else if (this.isSchoolsPost) {
        return this.schoolsPost
      } else {
        return this.post
      }
    },
    postItemType() {
      if (this.isClazzesPost) {
        return 'CLAZZES_POST'
      } else if (this.isSchoolsPost) {
        return 'SCHOOLS_POST'
      } else {
        return 'POST'
      }
    },
    postItems() {
      if (this.isClazzesPost) {
        return this.clazzesPosts
      } else if (this.isSchoolsPost) {
        return this.schoolsPosts
      } else {
        return this.posts
      }
    },
    isClazzesPost() { return this.clazzesPost.currentId },
    isSchoolsPost() { return this.schoolsPost.currentId },
    isManager() { return this.existsClassManagerByClassId({ classId: this.parentId }) },
    isScrap() { return this.postItem.isScrap || false },
    isWriteUser() { return !!(this.writeUser && this.writeUser.userType) },
    isPostTypeMeal() { return this.postType === this.CONSTANTS.POST_TYPE.MEAL },

    /**
     * item props entity
     * @returns {*}
     */
    itemUri() { return this.postItem._links.self.href || null },
    postId() { return this.postItem.currentId || null },
    postMustRead() { return this.postItem.postMustRead || false },
    postTitle() { return this.postItem.postTitle },
    postContent() { return this.postItem.postContent },
    postType() { return this.postItem.postType || ''},
    posted() { return this.postItem.posted || null },
    postStatus() { return this.postItem.postStatus || '' },
    homeworkType() { return this.postItem.homeworkType || '' },
    letterType() { return this.postItem.letterType || '' },
    files() { return this.postItem.files || [] },
    pushTarget() { return this.postItem.pushTarget || '' },
    writeUser() { return this.postItem.writeUser || {} },
    version() { return this.postItem.version || null },
    board() { return this.postItem.board || null },
    folder() { return this.postItem['folder'] || null },

    // 학교 게시글용
    schoolImagePath() {
      let schoolImagePath = ''
      switch (this.postItemType) {
        case this.CONSTANTS.POST_ITEM_TYPE.CLAZZES_POST:
        case this.CONSTANTS.POST_ITEM_TYPE.SCHOOLS_POST: {
          schoolImagePath = this.postItem.schoolImagePath
          break
        }
        default: { schoolImagePath = this.postItem.parent.schoolImagePath }
      }
      return schoolImagePath
    },
    schoolName() {
      let schoolName = ''
      switch (this.postItemType) {
        case this.CONSTANTS.POST_ITEM_TYPE.CLAZZES_POST:
        case this.CONSTANTS.POST_ITEM_TYPE.SCHOOLS_POST: {
          schoolName = this.postItem.schoolName
          break
        }
        default: { schoolName = this.postItem.parent.schoolName }
      }
      return schoolName
    },

    postPin: {
      get() { return this.postItem.postPin || false },
      set(val) {
        if (this.isClazzesPost) this.clazzesPost.postPin = val
        else if (this.isSchoolsPost) this.schoolsPost.postPin = val
        else this.post.postPin = val
      }
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
    postTypeName() {
      const params = this.postType === 'NOTE'
        ? { code: this.postType, type: this.classSchoolType || this.schoolType }
        : { code: this.postType }

      return this.getPostTypeNameByCode(params)
    },
    classSchoolType() {
      if (this.curClassItem.classSchoolType) {
        return this.curClassItem.classSchoolType
      } else if (this.post?.parent?.classSchoolType) {
        return this.post.parent.classSchoolType
      } else {
        return null
      }
    },
    classStatus() {
      // 클래스 상세 > 게시글 목록
      if (this.postItemType === 'CLAZZES_POST')
        return this.curClassItem.classStatus

      return this.postItem && this.postItem.parent
        ? this.postItem.parent.classStatus
        : null
    },
    /**
     * isParentActivated (class, school)
     * @returns {boolean}
     */
    isParentActivated() {
      return this.isClassPost
        ? this.classStatus === this.CONSTANTS.CLASS_STATUS.ACTIVATE
        : true
    },
    isParentDeactivated() {
      return this.isClassPost
          ? this.classStatus === this.CONSTANTS.CLASS_STATUS.DEACTIVATE
          : false
    },
    isEvent() { return this.postType === 'EVENT' },
    isTemporary() { return this.postStatus === 'TEMPORARY' },
    isReserve() { return this.postStatus === 'RESERVE' },
    isClassPost() {
      return ['NOTE', 'ALBUM', 'BOARD', 'HOMEWORK'].includes(this.postType)
    },

    mediaFiles() {
      return this.files.filter(d => {
        return (
          d.fileContentType.includes('image/') ||
          d.fileContentType.includes('video/')
        )
      })
    },
    noMediaFiles() {
      return this.files.filter(d => {
        return (
          !d.fileContentType.includes('image/') &&
          !d.fileContentType.includes('video/')
        )
      })
    },
    homeworkStatusTitle() {
      return this.isManager ? '과제현황' : '과제제출'
    },

  },
  watch: {
    'popupFlag.isEdit'(val) {
      if (val === false) {
        this.componentKey++
      }
    }
  },
  mounted() {
    eventBus.$on(`refresh-post-edit-post-item-attr|${this.postId}`, () => {
      this.componentKey++
    })
  },
  beforeDestroy() {
    eventBus.$off(`refresh-post-edit-post-item-attr|${this.postId}`)
  },
  methods: {
    ...mapMutations({
      setCurPostEdit: 'setCurPostEdit'
    }),
    ...mapActions({
      isManagedPost: 'isManagedPost',
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    compScrap(val) {
      this.isScrap = val

      // 나의 스크랩 페이지일 경우
      if (this.cardOption.isMypageScrapItem) {
        let obj = {
          isVal: val,
          index: this.i
        }
        this.$emit('compScrap', obj)
      }
    },
    async editPost(type) {
      if (type && (type === 'BLACKBOARD' || type === 'BLACKBOARD_UPDATE'))
        this.editNote(type)
      else {
        // this.popupFlag.isEdit = true
        const response = await this.$hiClass.posts.read(this.itemUri)
        const post = response.data

        this.setCurPostEdit({
          isOpen: true,
          componentKey: 0,  //
          post: post,  //

          postItem: this.postItem,  // 목록 갱신용으로 전달
          // posts: [],  //
          paramOption: {
            isManager: this.isManager,
            editMode: 'update',
            // clazz: {},  //
          },
          // paramModel: {
            // parentUri: null,
            // postType: this.postType,
          // }
          parentId: this.parentId,
          schoolType: this.schoolType,
          postVersion: post.version,
          create: false
        })
      }
    },
    editNote(type) {
      const userUUID = this.$store.state.user.currentId
      const classUUID = this.$route.params.id || this.parentId
      const postURI = this.postItem._links.self.href
      const version = this.postItem.version
      let folderId = ''
      if(this.postItem.folder) folderId = this.postItem.folder.folderId
      if (userUUID === undefined) {
        this.$hiClass.alert('사용자 정보를 찾을 수 없습니다.')
        return false
      }

      this.triggerAnalyticsLogEvent({ code: 'analytics.class.click.button.note.more' })

      const param = { userUUID, classUUID, postURI, version }
      if(folderId) param.folderId = folderId
      if(type) param.type = type
      window.open(
          '/main/clazzes/note/newboard'.concat(
              this.$comn.jsonToQueryString(param)
          ),
          'updateNote',
          `height=${screen.availHeight - this.$store.state.TASKBAR_HEIGHT}
          ,width=${screen.availWidth -
          this.$store.state
              .NOTEBOARD_MARGIN_WIDTH},top=0,left=0,resizable,scrollbars=1`
      )
    },
    deletePost(postId = false) {
      if (postId) {
        this.reloadPosts()
      } else {
        this.$hiClass.confirm('게시글을 삭제하시겠습니까?', 'warning')
          .then(async() => {
            this.deletePostOk()
          })
      }
    },
    async deletePostOk() {
      const url = `/posts/${this.postId}`

      try {
        const res = await this.$hiClass.posts.delete(url)
        this.reloadPosts()
      } catch (err) {
        this.$log.debug('post delete err', err)
        this.$router.go(0)
      }
    },
    reloadPosts() {
      this.postItem.del = true
      const newList = [...this.postItems]
      this.$emit('delete-new-list', newList.filter(v => v.postId !== this.postId))
      eventBus.$emit('delete-post-pin', { postId: this.postId })
    },
    movePost(post) {
      this.postItem.board.boardId = post.board.boardId
      this.postItem.board.boardName = post.board.boardName
      this.postItem.board.postType = post.board.postType
      this.postItem.board.isReadParents = post.board.isReadParents
      this.postItem.board.isReadStudent = post.board.isReadStudent
      this.postItem.pushTarget = post.pushTarget
      this.postItem.postType = post.board.postType
      this.postItem.board.isUsedComment = post.board.isUsedComment
      this.postItem.board.isUsedLike = post.board.isUsedLike

      if(post.folder) {
        // this.postItem.board.folder = null
        this.postItem.folder = {
          color: post.folder.color,
          folderId: post.folder.folderId,
          folderName: post.folder.folderName
        }
      } else {
        this.postItem.folder = null
      }
  
      if(this.curForm !== "ALL") {
        const el = this.$refs[`board-item-postId-${post.postId}`]
        el.classList.add("move")
        eventBus.$emit('get-clazz-post-top')
        const newList = _.cloneDeep(this.postItems).filter(v => v.postId !== post.postId)
        setTimeout(() => {
          this.$emit('delete-new-list', newList)
        }, 200)
      }
    },
    copyPost(post) {
      this.setCurPostEdit({
        isOpen: true,
        componentKey: 0,
        post: post,
        paramOption: {
          isManager: this.isManager,
          editMode: 'copy'
        },
        parentId: this.parentId,
        schoolType: this.schoolType,
        postVersion: post.version,
        create: true
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.on {
  display: block;
}
</style>

<style lang="scss">
// 뱃지 간격 수정
.school-class-cont-item .item-title-wrap .title > div {
  margin-left: 3px;
}
.item-cont-wrap {
  table th, table td {
    border: 1px solid black;
  }
}
</style>
