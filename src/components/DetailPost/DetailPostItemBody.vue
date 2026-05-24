<template>
  <div
    :key="`${post.currentId}-key-${componentKey}`"
    class="slide"
  >
    <article
      v-click-outside="vcoConfig"
      :key="`detail-post-item-body-${postType}`"
      class="hi-board"
      :class="{
        'event-temp-item': isEvent
      }"
      @mouseover="offVco"
      @mouseleave="onVco"
    >
      <!-- 2022-08-01 위치 이동 -->
      <div class="board__top">
        <template v-if="ignoreGoPageByPostType()">
          <p class="link">{{ getPostParentName(post) }}&nbsp;</p>
        </template>
        <template v-else>
          <a href="javascript:" class="link" @click="goPage()">{{ getPostParentName(post) }}</a>&nbsp;
        </template>
      </div>
      <!-- //2022-08-01 위치 이동 -->

      <card-item-header
        :key="`card-item-header-${componentKey}`"
        :is-parent-activated="isParentActivated"
        :is-manager="isManager"
        :is-temporary="isTemporary"
        :is-reserve="isReserve"
        :post-id="postId"
        :post-item="post"
        :post-must-read="postMustRead"
        :post-title="postTitle"
        :post-type="postType"
        :post-type-name="postTypeName"
        :posted="posted"
        :post-status="postStatus"
        :post-pin.sync="postPin"
        :school-image-path="schoolImagePath"
        :school-name="schoolName"
        :school-type="schoolType"
        :version="version"
        :write-user="writeUser"
        :board="board"
        :folder="folder"
        :is-show-folder-name="true"
        :is-detail="true"
        @movePost="movePost"
        @copyPost="copyPost"
        @movePostClose="movePostClose"
        @is-post="editPost"
        @is-delete="deletePost"
      />

      <post-meal
        v-if="isMeal"
        :key="`post-meal-${componentKey}`"
        :post-item="postItem"
        :post-item-type="postItemType"
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
        @is-post="editPost"
      />

      <!-- [V1] content wrap -->
      <div
        v-if="post.version === null || post.version === 'V1'"
        class="item-cont-wrap"
      >
        <div
          v-if="isShowComment && (isStatusActivatePostTypeByPost(post))"
          class="education-share-cont-wrap"
        >
          <div class="share-des">
            <ul><li>* 남을 비방하거나 부적절한 내용의 댓글은 별도의 통보없이 운영자가 임의로 삭제 처리합니다!</li></ul>
          </div>
        </div>
      </div>
      <!-- // [V1] content wrap -->

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
        :isShowScrap="isShowScrap2"
      />

      <div class="floating-btn-list-wrap">
        <ul>
          <li>
            <delicious-button 
              v-if="isShowDelicious"
              :isSync="true"
              :like.sync="postItem.isLike"
              :likeCount.sync="postItem.likeCount"
              :postItem="postItem"
              :isFloatingMode="true"
            />
          </li>

          <li>
            <like-button
              v-if="isShowLike"
              :key="`like-${postId}-floating-mode`"
              :isSync="true"
              :like.sync="postItem.isLike"
              :likeCount.sync="postItem.likeCount"
              :postItem="postItem"
              :isFloatingMode="true"
              :isReadOnly="!isParentActivated"
            ></like-button>
          </li>

          <li>
            <button
              v-if="isShowComment"
              class="floating-comment"
              :class="{ on: false }"
              @click="focusOnComment()"
            ></button>
            <div class="btn-tooltip">{{ $t('main.text.comment') }}</div>
          </li>

          <li>
            <scrap-button
              v-if="isShowScrap2"
              :key="`scrap-${postId}`"
              :isSync="true"
              :isFloatingMode="true"
              :isClassActivated="isParentActivated"
              :scrap.sync="postItem.isScrap"
              :postItem="postItem"
            ></scrap-button>
          </li>

          <li
            v-if="isShowShareBtn(post)"
            :class="{ on: curListOnIdx === 4 }"
            @click="
              curListOnIdx = 4;
              handleSharePop();
              triggerAnalyticsLogEvent({ code: `analytics.information.education.click.contentDetail.shareButton` })
            "
          >
            <share-btn-wrap
              :isFloating="true"
              :currentId="post.currentId"
              :isShowSharePop="isShowSharePop"
              @handleSharePop="handleSharePop"
            ></share-btn-wrap>
          </li>

        </ul>
      </div>

    </article>
    <!-- // end detail post item -->

    <post-edit
      v-if="post.version === 'V2' && this.isUpdate"
      :post="post"
      :posts="postsList"
      :paramOption="{
        isManager: isManager,
        isOpenedDetailPopup: true,
        editMode: 'update',
        clazz: post.parent
      }"
      :paramModel="{
        parentUri: post.parentUri,
        postType: post.postType
      }"
      @close-popup="isShowHandle(false)"
    />

    <!-- 알림장 인쇄하기 -->
    <div v-if="isPrintView" class="school-class-cont-item boundary-box">
      <print-form
        :content="post.postContent"
        :isPrintView="isPrintView"
        :className="post.parent.className"
        :updatedTimestamp="post.updatedTimestamp"
        @closePrintForm="initIsPrintView"
      >하이클래스 {{ mainCategoryList.NOTE }}</print-form>
    </div>
  </div>
</template>

<script>
import { eventBus } from '@/main'
import {mapActions, mapGetters, mapMutations, mapState} from "vuex"

import ShareBtnWrap from '@/components/Card/footer/ShareButton'
import ErrorLoadFailAsyncComponent from "@/apps/error/ErrorLoadFailAsyncComponent.vue"
import CardItemHeader from "@/components/Card/CardItemHeader";
import CardItemContent from "@/components/Card/CardItemContent";
import CardItemFooter from "@/components/Card/CardItemFooter";
import LikeButton from "@/components/Card/footer/LikeButton";
import ScrapButton from "@/components/Card/footer/ScrapButton";
import PostEvent from "@/components/Card/content/PostEvent";
import PostMeal from "@/components/Card/content/PostMeal";
import DeliciousButton from "@/components/Card/footer/DeliciousButton";
import {mapFields} from "vuex-map-fields";

const PostEdit = () => ({
  component: import('@/components/Popup/PostEdit.vue'),
  error: ErrorLoadFailAsyncComponent,
})
const HcVideo = () => ({
  component: import('@/components/Form/HcVideo.vue'),
  error: ErrorLoadFailAsyncComponent,
})
const PrintForm = () => ({
  component: import('@/components/Viewer/PrintViewer.vue'),
  error: ErrorLoadFailAsyncComponent,
})

export default {
  name: 'detail-post-item-body',
  props: [
    'post',
    'postUri',
    'path',
    'parentUriList',
    'curSlide',
    'postsList',
  ],
  data() {
    return {
      mainCategory: '',
      commentListLeng: 0,
      curListOnIdx: 0,
      // isImgView: false,
      isOpenImgLayer: false,
      isClickShareBtn: false,
      isClicked: false,
      isShowSharePop: false,
      isPrintView: false,
      commentContentLength: 0,
      isUpdate: false,
      // post: null,
      curPostIdx: 0,
      docFile: '',
      clazzMemberRole: '',
      isStatus: false,
      vcoConfig: {
        handler: this.handler,
        middleware: this.middleware,
        events: ['click'],
        // Note: The default value is true, but in case you want to activate / deactivate
        //       this directive dynamically use this attribute.
        isActive: true
      },
      componentKey: 0,
      isOnTerm: false
    }
  },
  components: {
    PostMeal,
    PostEvent,
    ScrapButton,
    LikeButton,
    CardItemFooter,
    CardItemContent,
    CardItemHeader,
    ShareBtnWrap,
    PostEdit,
    PrintForm,
    DeliciousButton
  },
  computed: {
    ...mapState({
      NOTEBOARD_MARGIN_WIDTH: 'NOTEBOARD_MARGIN_WIDTH',
      TASKBAR_HEIGHT: 'TASKBAR_HEIGHT',
      clazzSubscribeViews: 'clazzSubscribeViews',
      userUri: 'userUri',
      userProfileDefault: 'userProfileDefault',
      curPostTerms: 'curPostTerms',
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
      isAvailableClazzHomeworkSubmit: 'isAvailableClazzHomeworkSubmit',
      getPostTypeNameByCode: "getPostTypeNameByCode",
      getUserTypeNameByCode: 'getUserTypeNameByCode',
    }),
    ...mapGetters('storeHome', {
      getSectionsBySectionType: 'getSectionsBySectionType'
    }),
    ...mapState('storeHome', {
      sectionMains: 'sectionMains'
    }),
    ...mapFields({
      curClazzesPosts: 'curClazzesPosts'
    }),
    ...mapState('storeImageEditor', {
      isImageEditorShow: 'isShow'
    }),
    postItem() {
      return this.post
    },
    postItemType() {
      return 'POST'
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

    itemUri() { return this.postItem._links.self.href || null },
    postId() { return this.postItem.currentId || null },
    postMustRead() { return this.postItem.postMustRead || false },
    postTitle() { return this.postItem.postTitle },
    postType() { return this.postItem.postType || ''},
    version() { return this.postItem.version || null },
    schoolType() {
      let parent = this.postItem.parent || {}
      if (parent.schoolType) {
        return parent.schoolType
      }
      if ((parent.school || {}).schoolType) {
        return parent.school.schoolType
      }
      return ''
    },
    schoolImagePath() { return this.postItem.parent.schoolImagePath || null },
    schoolName() { return this.postItem.parent.schoolName || null },
    className() { return this.postItem.parent.className || null },
    postPin: {
      get() { return this.postItem.postPin },
      set(val) { this.post.postPin = val }
    },
    isParentActivated() {
      if (this.isStatusActivatePostType) {
        return true
      } else if (this.isClassPost) {
        return this.post.parent.classStatus === this.CONSTANTS.CLASS_STATUS.ACTIVATE
      } else if (this.isSchoolPost) {
        return this.post.parent.schoolStatus === this.CONSTANTS.SCHOOL_STATUS.ACTIVATE
      } else {
        return false
      }
    },

    // 첨부파일 허용 대상
    isUseFileUpload() {
      return this.post.postType === 'BOARD' ||
        this.post.postType === 'HOMEWORK' ||
        this.post.postType === 'NOTE' ||
        this.post.postType === 'ALBUM';
    },
    isStatusActivatePostType() {
      const statusActivatePostTypes = ['EDUCATION', 'EVENT', 'HINOTICE', 'CP_BOARD']
      return this.post && this.post.postType && statusActivatePostTypes.includes(this.post.postType)
    },
    isReadPost() {
      return this.post.isRead
    },
    user() {
      return this.$store.state.user
    },
    isManager() {
      return this.clazzMemberRole === 'OWNER' ||
        this.clazzMemberRole === 'MANAGER'
    },
    isMore() {
      return (
        this.isParentActivated &&
          (this.isManager ||
              (
                this.post.insertedUser &&
                this.post.insertedUser.currentId === this.$store.state.user.currentId
                && this.itemWriteUsed()
              )
          )
      )
    },
    isMemberParents() {
      return !this.isManager && (this.user.userType === 'TEACHER' || this.user.userType === 'PARENTS')
    },
    isMemberStudent() {
      return !this.isManager && this.user.userType === 'STUDENT'
    },
    isShowComment() {
      const board = this.post.board
      const curPostCommentUsed = this.post.postCommentUsed // 클래스 게시글이 아닌 경우 참조
      const curPostType = this.post.postType
      let flag = false

      try {
        switch (curPostType) {
          // 클래스 게시글의 댓글 권한 확인
          case 'NOTE':
          case 'ALBUM':
          case 'BOARD':
          case 'HOMEWORK': {
            const isCurPostTypeCommentParentsUsed = this.isMemberParents && board.isCommentParents
            const isCurPostTypeCommentStudentUsed = this.isMemberStudent && board.isCommentStudent

            flag = board.isUsedComment &&
              (this.isManagedPost() || isCurPostTypeCommentParentsUsed || isCurPostTypeCommentStudentUsed)
            break
          }
          default: {
            flag = curPostCommentUsed  && this.isStatusActivatePostType
          }
        }
      } catch (e) {
        this.$log.error(e)
      }

      return flag
    },
    userTypeNames() {
      let arr = []
      if (this.post.userType.includes('TEACHER')) arr.push('선생님')
      if (this.post.userType.includes('PARENTS')) arr.push('학부모')
      if (this.post.userType.includes('STUDENT')) arr.push('학생')

      return arr.toString()
    },
    isUserTypeNames() {
      let showPostTypes = ['NOTE', 'ALBUM', 'BOARD', 'HOMEWORK']
      return showPostTypes.includes(this.post.postType)
    },
    isNote() {
      return this.post.postType === 'NOTE'
    },
    isAlbum() {
      return this.post.postType === 'ALBUM'
    },
    isBoard() {
      return this.post.postType === 'BOARD'
    },
    isHomework() {
      return this.post.postType === 'HOMEWORK'
    },
    isMeal() {
      return this.post.postType === 'MEAL'
    },
    isEvent() {
      return this.post.postType === 'EVENT'
    },
    isPostStatusComplete() {
      return this.post.postStatus === 'COMPLETE'
    },
    homeworkStatusTitle() {
      return this.isManagedPost() ? '과제현황' : '과제제출'
    },
    isGrantedMemberByHomework() {
      const homeworkType = this.post.homeworkType
      const isManager = this.isManagedPost()
      const isSubmitMember = homeworkType === 'SUBMIT'
      const isNotSubmitMember = homeworkType === 'NOT_SUBMIT'
      const isAvailableClazzHomeworkSubmit =
        this.isAvailableClazzHomeworkSubmit({ board: this.post.board })

      this.$log.debug(
        'isManager, isSubmitMember, isNotSubmitMember, isAvailableClazzHomeworkSubmit :'
        , isManager
        , isSubmitMember
        , '('
        , isNotSubmitMember
        , isAvailableClazzHomeworkSubmit
        , ')'
      )

      return isManager
        || isSubmitMember
        || (isNotSubmitMember && isAvailableClazzHomeworkSubmit)
    },
    isClassPost() {
      return ['NOTE', 'ALBUM', 'BOARD', 'HOMEWORK'].includes(this.post.postType)
    },
    isSchoolPost() {
      return ['NOTICE', 'MEAL', 'ALARM'].includes(this.post.postType)
    },
    isHinoticePost() {
      return ['HINOTICE'].includes(this.post.postType)
    },
    isCpBoardPost() {
      return ['CP_BOARD'].includes(this.post.postType)
    },
    isReportUse() {
      return !this.isClassPost && !this.isHinoticePost
    },
    itemLikeUsed() {
      return this.isClassPost
        ? this.post.board.isUsedLike
        : true
    },
    isShowDelicious() {
      return this.post.postType === "MEAL"
    },
    isShowLike() {
      return !this.isSchoolPost && this.itemLikeUsed
    },
    isShowScrap() {
      return !this.isCpBoardPost
    },
    isShowScrap2() {
      return !(this.isCpBoardPost && (this.user.userType === 'STUDENT' || this.user.userType === 'PARENTS'))
    },
    isShowBottomToolbar() {
      return this.isShowScrap || this.isShowLike || this.isShowComment || this.isShowShareBtn(this.post)
    },
    isExportedPostByTkBell() {
      return this.post.letterType === 'TKBELL'
    },
    isPopupNote() {
      return this.mainCategoryList.NOTE === '알림장'
    },
    mainCategoryList() {
      const mainCategoryList = {
        NOTE: '알림장',
        ALBUM: '앨범',
        BOARD: '자유게시판',
        HOMEWORK: '과제',
        ALARM: '가정통신문',
        MEAL: '급식',
        NOTICE: '학교공지',
        EDUCATION: '추천정보',
        EVENT: '이벤트',
        HINOTICE: '공지사항',
        CP_BOARD: 'CP게시글',
        ALARM_EDU_OFFICE: '가정통신문(교육청)'
      }
      if (this.post.parent != null) {
        if (this.schoolType !== '') {
          mainCategoryList.NOTE = this.getPostTypeNameByCode({
            code: 'NOTE',
            type: this.post.parent.classSchoolType || this.schoolType
          })
        }
      }
      if (this.post.postType === 'CP_BOARD' && this.post.category && this.post.category.name) {
        mainCategoryList.CP_BOARD = this.post.category.name
      }
      return mainCategoryList
    },
    isClassTextWrap() {
      return this.isManagedPost()
        || this.post.postTitle && this.post.postTitle.length > 0
        || this.isNote
        || this.isMeal
    },
    postTypeName() {
      return this.mainCategoryList[this.post.postType]
    },
    isTemporary() {
      return this.post.postStatus === 'TEMPORARY'
    },
    isReserve() {
      return this.post.postStatus === 'RESERVE'
    },
    posted() {
      return this.post.posted || null
    },
    postStatus() {
      return this.post.postStatus || ''
    },
    postedStr() {
      let dateFormat = 'M[월] D[일] ddd[요일]'
      const nowYear = this.$moment().year()
      const paramYear = this.$moment(this.posted).year()

      if (this.isTemporary || this.isReserve)
        dateFormat = 'M[월] D[일] ddd[요일] HH:mm'

      if (nowYear - paramYear > 0)
        dateFormat = `YYYY[년] ${dateFormat}`

      return this.$moment(this.posted).format(dateFormat)
    },
    postedSuffix() {
      let suffix = ''

      if (this.postStatus === 'RESERVE') suffix = '예약'
      else if (this.postStatus === 'TEMPORARY') suffix = '임시저장'

      return suffix
    },
    writeUserPhoto() {
      return this.post.writeUser.userPhoto
    },
    writeUser() { return this.postItem.writeUser || {} },
    board() { return this.post.board || null },
    folder() { return this.post['folder'] || null },
    postTerms() {
      return this.curPostTerms.isOpen
    }
  },
  watch: {
    isUpdate(val) {
      if (val === false) {
        this.componentKey++
      }
    },
    postTerms(n, o) {
      this.vcoConfig.isActive = false
      this.isOnTerm = true
    }
  },
  created() {
    if (this.post.del) {
      this.isShowOff()
      this.offVco()
      alert('삭제된 게시물입니다.')
      return false
    }

    eventBus.$on('detail-post-item-body-on-vco', () => {
      this.onVco()
    })
    eventBus.$on('detail-post-item-body-off-vco', () => {
      this.offVco()
    })
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')

    this.triggerAnalyticsLogEvent({ code: `analytics.contents.detail.loadPage.${this.post.postType.toLowerCase()}` })

    // 클래스 구독 여부 체크
    if (this.post.parent !== null)
      this.checkCurUserClassSubscribe()

    this.checkPostReadUser()

    eventBus.$on(`refresh-detail-post-item-attr|${this.postId}`, () => {
      this.componentKey++
    })
  },
  beforeDestroy() {
    eventBus.$off(`refresh-detail-post-item-attr|${this.postId}`)
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')

    eventBus.$off('detail-post-item-body-on-vco')
    eventBus.$off('detail-post-item-body-off-vco')
  },
  methods: {
    ...mapMutations({
      setIsShowDetailPostLayer: 'setIsShowDetailPostLayer',
      setItemDetailObj: 'setItemDetailObj',
      setCurPostEdit: 'setCurPostEdit',
    }),
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    getMainCategory(item) {
      return this.mainCategoryList[item.postType]
    },
    getSubCategory(post) {
      if (post.postType === 'EVENT') {
        return post.displayStatus === 'CLOSED'
          ? this.$t('main.education.event.end') : post.displayStatus === 'EXPECTED' ?
                this.$t('main.education.event.pre') : this.$t('main.education.event.ing')
      } else {
        return post.parent ? post.parent.infoTitle : post.postTitle
      }
    },
    getCommentLength(val) {
      return (this.commentListLeng = val)
    },
    getWriteUserName(item) {
      if (item.writeUser) {
        let user = item.writeUser.userName + ' '
        const memberRole = item.writeUser.memberRole
        const userTypeName = this.getUserTypeNameByCode({code: item.writeUser.userType})
        const memberChildName = item.writeUser.memberChildName || '탈퇴회원'

        if (this.isClassPost) {
          switch (memberRole) {
            case 'MANAGER':
            case 'OWNER':
              user += userTypeName
              break

            // 클래스 탈퇴 등으로 구독 정보가 삭제된 경우
            case null:
              user += '(탈퇴회원)'
              break

            default:
              user += `(${memberChildName} ${userTypeName})`
          }
        }
        return user

      } else {
        return ''
      }
    },
    focusOnComment() {
      eventBus.$emit(`${this.postItemType}-focus-write-comment-area-by-post-id|${this.post.currentId}`)
    },
    initCurListIdx() {
      if (this.curListOnIdx === 4 || this.curListOnIdx === 5) {
        this.curListOnIdx = 0
      }
    },
    isStatusActivatePostTypeByPost(post) {
      const statusActivatePostTypes = ['EDUCATION', 'EVENT', 'HINOTICE', 'CP_BOARD']
      return post && post.postType && statusActivatePostTypes.includes(post.postType)
    },
    isShowShareBtn(post) {
      return this.isStatusActivatePostTypeByPost(post)
    },
    isShowOff() {
      let flag = true
      let pass = true

      if (this.isOpenImgLayer) {
        this.isOpenImgLayer = false
        pass = false
      }

      if (this.curListOnIdx === 4 || this.curListOnIdx === 5) {
        this.isClickShareBtn = false
        pass = false
      }
      if ((!this.isOpenImgLayer || !this.isClickShareBtn) && pass) flag = false

      this.$log.debug(this.commentContentLength)

      if (this.commentContentLength > 0) flag = true

      this.isShow = flag
      this.$emit('isShowOff', this.isShow)
    },
    isExistPostTitle(post) {
      return post.postTitle !== undefined &&
        post.postTitle !== null &&
        post.postTitle.trim().length > 0
    },
    isExistPostContent(post) {
      return (post.postContent !== undefined &&
        post.postContent !== null &&
        post.postContent.trim().length > 0) ||
        this.$comn.isImage(post.files, false).length > 0;
    },
    clazzPosts(post) {
      let arr = ['NOTE', 'BOARD', 'ALBUM', 'HOMEWORK']
      return arr.indexOf(post.postType)
    },
    schoolPosts(post) {
      let arr = ['NOTICE', 'ALARM', 'MEAL']
      return arr.indexOf(post.postType)
    },
    textareaPosts(post) {
      let arr = ['BOARD', 'ALBUM', 'HOMEWORK']
      return arr.indexOf(post.postType)
    },
    click() {
      this.isClicked = true
    },
    unclick() {
      this.isClicked = false
    },
    toggleClick() {
      this.isClicked = !this.isClicked
    },
    getCommnetContentLength(val) {
      this.commentContentLength = val
    },
    isShowPostMoreBtn() {
      let flag = false
      let arr = ['NOTE', 'ALBUM', 'BOARD', 'HOMEWORK']
      // 더보기 버튼을 출력할 postType
      if (arr.indexOf(this.post.postType) > -1) {
        flag = true
      }
      return flag
    },
    isMyPost() {
      let flag = false
      // 본인이 작성한 게시글인 경우

      if (
        this.isShowPostMoreBtn() &&
        this.post.insertedUser !== null &&
        this.post.insertedUser !== undefined &&
        this.post.insertedUser._links.self.href === this.userUri
      ) {
        flag = true
      } else if (
        this.isShowPostMoreBtn() &&
        this.post.insertedUserId !== null &&
        this.post.insertedUserId !== undefined &&
        this.post.insertedUserId === this.user.currentId
      ) {
        flag = true
      }
      return flag
    },
    isManagedPost() {
      let flag = false
      // 클래스 관리자인 경우
      if (this.isShowPostMoreBtn()) {
        const parentUri = this.post.parentUri
        let managedClassList = this.clazzSubscribeViews.filter(
          d => {
            return (
              parentUri.includes(d.classId) &&
              (d.memberRole === 'OWNER' || d.memberRole === 'MANAGER')
            )
          }
        )
        if (managedClassList.length > 0) flag = true
      }
      return flag
    },
    isManagedPostByNote() {
      let flag = false
      // 클래스 관리자인 경우 - 알림장만
      if (this.post.postType === 'NOTE') {
        const parentUri = this.post.parentUri
        let managedClassList = this.clazzSubscribeViews.filter(
          d => {
            return (
              parentUri.includes(d.classId) &&
              (d.memberRole === 'OWNER' || d.memberRole === 'MANAGER')
            )
          }
        )
        if (managedClassList.length > 0) flag = true
      }
      return flag
    },
    isVisibleRemindPushButton(post) {
      const postType = post.postType
      const writeUser = post.writeUser
      const insertedUser = post.insertedUser
      const memberRole = writeUser.memberRole
      const serviceUserType = writeUser.userType || insertedUser.userType
      const forceVisiblePostTypes = ['NOTE', 'HOMEWORK']
      const isWriteUserTeacher = memberRole === 'OWNER' || memberRole === 'MANAGER' || serviceUserType === 'TEACHER'

      return post.version === 'V2'
        && post.postStatus === 'COMPLETE'
        && (forceVisiblePostTypes.includes(postType) || isWriteUserTeacher)
    },
    checkPostReadUser() {
      if(!this.isReadPost) {
        this.createPostReadUser()
      }
      /*
      this.searchPostReadUser()
        .then(res => {
          if (res.data.page.totalElements === 0)
            this.createPostReadUser()
        })
      */
    },
    searchPostReadUser() {
      const params = {
        _user: this.userUri,
        _post: this.postUri
      }
      return this.$hiClass.postReadUsers
        .search(params)
        .then(res => {
          this.$log.debug(this.$options.name, 'searchPostReadUser res: ', res)
          return res
        })
    },
    createPostReadUser() {
      const params = {
        deviceType: 'PC',
        post: this.postUri,
        user: this.userUri
      }
      this.$hiClass.postReadUsers
        .create(params)
        .then(() => {
          this.$log.debug(this.$options.name, 'postReadUsers created')
        })
    },
    isShowHandle(bool) {
      this.isUpdate = bool
    },
    openEdit(type) {
      // post version 'V2'
      if (this.post.version === 'V2') {
        type && type === 'BLACKBOARD'
          ? this.openPop(this.post.version)
          : this.isUpdate = true

      // post version 'V1' or 'null'
      } else {
        this.post.postType === 'NOTE' && this.mainCategoryList.NOTE === '알림장'
          ? this.openPop(this.post.version)
          : this.isUpdate = true
      }
    },
    openPop(version) {
      const param = {
        userUUID: this.$comn.split(this.userUri, '/'),
        classUUID: this.post.parent.currentId,
        postURI: this.postUri,
        // goMain: true,
        version
      }
      const height = screen.availHeight - this.TASKBAR_HEIGHT
      const width = screen.availWidth - this.NOTEBOARD_MARGIN_WIDTH

      window.open(
        '/main/clazzes/note/newboard'.concat(
          this.$comn.jsonToQueryString(param)
        ),
        'updateNote',
        `height=${height},width=${width},top=0,left=0,resizable,scrollbars=1`
      )

      this.isClicked = false
    },
    deletePost(postId = false) {
      if(postId) {
        this.deletePostOk()
      } else {
        this.$hiClass.confirm('게시글을 삭제하시겠습니까?', 'warning')
          .then(() => {
            this.deletePostOk()
          })
      }
    },
    async deletePostOk() {
      const url = `/posts/${this.postId}`

      try {
        this.$hiClass.posts
          .delete(url)
          .then(() => {
            // (기존) 목록에서 삭제 처리
            if (this.postsList && Array.isArray(this.postsList)) {
              const foundIndex = this.postsList.findIndex(post => post.currentId === this.postId)
              if (foundIndex > -1)
                this.postsList.splice(foundIndex, 1)
            }
            // (리뉴얼) 클래스 목록에서 삭제 처리
            if (this.curClazzesPosts && Array.isArray(this.curClazzesPosts)) {
              const foundIndex = this.curClazzesPosts.findIndex(post => post.currentId === this.postId)
              if (foundIndex > -1)
                this.curClazzesPosts.splice(foundIndex, 1)
            }
            // 공지 목록에서 삭제
            eventBus.$emit('delete-post-pin', { postId: this.postId })
            // 레이어 닫기
            this.isShowOff()
          })
          .catch(err => {
            this.$log.debug('post delete err', err)
            this.$router.go(0)
          })
      } catch (err) {
        this.$log.debug('post delete err', err)
        this.$router.go(0)
      }
    },
    compLike(val, isFloatingBtn) {
      this.$set(this.post, 'isLike', val)
      let likeCount = this.post.likeCount
      if (val) {
        this.$set(this.post, 'likeCount', likeCount + 1)
      } else {
        this.$set(this.post, 'likeCount', likeCount - 1)
      }

      // 플로팅 좋아요 클릭 시 하단 좋아요 카운팅
      if (isFloatingBtn) {
        if (val) this.$refs.like1.curLikeCount += 1
        else this.$refs.like1.curLikeCount -= 1
      }

      // 플로팅 좋아요 버튼이나 하단 좋아요 버튼 클릭 시 양쪽에 좋아요 효과 주기 ( true, false)
      this.$refs.like1.curLikeChk = val
      this.$refs.like2.curLikeChk = val
    },
    compScrap(val) {
      this.post.isScrap = val

      // 플로팅 스크랩 버튼이나 하단 스크랩 버튼 클릭 시 양쪽에 스크랩 효과 주기 ( true, false)
      this.$refs.scrap1.curScrapChk = val
      this.$refs.scrap2.curScrapChk = val
    },
    ignoreGoPageByPostType() {
      const ignoreTypes = ['CP_BOARD', 'EDUCATION']
      return ignoreTypes.includes(this.post.postType)
    },
    goPage() {
      let parentTypes = {
        NOTE: 'clazzes',
        ALBUM: 'clazzes',
        BOARD: 'clazzes',
        HOMEWORK: 'clazzes',
        NOTICE: 'schools',
        MEAL: 'schools',
        ALARM: 'schools',
        ALARM_EDU_OFFICE: 'schools',
        EVENT: 'event',
        HINOTICE: 'hinotice'
      }

      let parentType = parentTypes[this.post.postType]
      let url = ''
      let currentId = ''

      if(!parentType)
        return false

      if (parentType === 'hinotice') {
        currentId = this.post.currentId
        url = `/help/notice` // ?hinoticeId=${currentId}`

      } else {
        url = '/main/'

        if (parentType === 'clazzes' || parentType === 'schools') {
          currentId = this.post.parent.currentId + '/'
          url += parentType + '/' + currentId + this.post.postType.toLowerCase()
        } else {
          url += 'education/' + parentType
        }

        if (parentType === 'clazzes' && this.post.board) {
          const boardId = this.post.boardId

          const isUsedFolder = this.post.board.isUsedFolder
          url += `/${boardId}`

          if (isUsedFolder) {
            const folderId = this.post.folder ? this.post.folder.folderId : ''
            url += `/${folderId}`
          }
        }
      }
      this.$router.push(url, () => {})
      this.$parent.isShow = false

      this.$nextTick(() => {
        this.closeDetailPopup()
      })
    },
    handleSharePop(flag) {
      if (flag === undefined) this.isShowSharePop = !this.isShowSharePop
      else if (flag) this.isShowSharePop = true
      else if (!flag) this.isShowSharePop = false
    },
    initIsPrintView(val) {
      this.isPrintView = val
    },
    closeDetailPopup() {
      this.setIsShowDetailPostLayer(false)
      this.setItemDetailObj({})
    },
    checkCurUserClassSubscribe() {
      const postClassId = this.post.parent.currentId

      if (postClassId !== undefined) {
        let classes = this.clazzSubscribeViews.filter(d => {
          return d.classId === postClassId
        })

        if (classes.length > 0) {
          this.clazzMemberRole = classes[0].memberRole
        }
      }
    },
    /**
     * 과제현황 펼치기
     */
    openHomeworkStatus() {
      this.isStatus = !this.isStatus
    },

    setPostContentEditor(postContent) {
      if (postContent === undefined || postContent === null)
        return null

      let domParser = new DOMParser()
      let postContentDocument = domParser.parseFromString(postContent, 'text/html')

      const editorElement = postContentDocument.body.querySelector('.class-fr-editor')
      this.post.postContentEditor = editorElement.innerHTML

      return this.post.postContentEditor
    },

    itemWriteUsed() {
      const postType = this.post.postType
      const board = this.post.board
      const isManager = this.isManager

      return this.$hiClass.itemWriteUsed(postType, board, isManager) || false
    },

    getPostParentName(post) {
      let postParentName = ''

      switch (post.postType) {
        case 'NOTE':
        case 'ALBUM':
        case 'BOARD':
        case 'HOMEWORK':
          postParentName = post.parent.className
          break
        case 'NOTICE':
        case 'MEAL':
        case 'ALARM':
        case 'ALARM_PLUS':
        case 'ALARM_EDU_OFFICE':
          postParentName = post.parent.schoolName
          break
        case 'EDUCATION':
        case 'EVENT':
          postParentName = this.getSubCategory(post)
          break
        case 'HINOTICE':
          postParentName = this.getMainCategory(post)
          break
        default:
          postParentName = this.getMainCategory(post)
      }

      return postParentName
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
        })
        this.$store.commit('setIsShowDetailPostLayer', false)
      }
    },

    editNote(type) {
      const userUUID = this.user.currentId
      const classUUID = this.post.parent.currentId
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

    /**
     * v-click-outside
     */
    // onClickOutside(event) {
    //   // this.$log.debug('Clicked outside. Event: ', event)
    // },
    handler(e) {
      // this.$log.debug(
      //   'Clicked outside (Using config), middleware returned true :)'
      // )
      // this.$log.debug('handler event: ', event)
      this.$log.debug(
        `handler this.vcoConfig.isActive 11 => `,
        this.vcoConfig.isActive
      )
      if (e.target.id === 'imageEditorCancelBtn' || e.target.id === 'imageEditorDoneBtn' || this.isImageEditorShow) {
        return false
      }
      if (this.vcoConfig.isActive) this.closeDetailPopup()
    },
    // Note: The middleware will be executed if the event was fired outside the element.
    //       It should have only sync functionality and it should return a boolean to
    //       define if the handler should be fire or not
    middleware(event) {
      // this.$log.debug('middleware event: ', event)
      this.$log.debug(
        `middleware this.vcoConfig.isActive 22 => `,
        this.vcoConfig.isActive
      )
      return event.target.className !== 'detail-post-item-body'
    },
    onVco() {
      // Modal in new Modal 대응
      const hiModalCommons = document.getElementsByClassName('hi-modal-common')
      if (hiModalCommons && hiModalCommons.length > 0)
        return false

      if(this.curPostTerms.isOpen === true) {
        this.vcoConfig.isActive = false
        return
      }
      const modals = document.getElementsByClassName('modal')
      const sweetAlerts = document.querySelectorAll('.swal2-container')
      
      if (modals.length < 2 && sweetAlerts.length < 1) {
        if(sweetAlerts.length < 1) {
          setTimeout(() => {
            const sweetAlerts = document.querySelectorAll('.swal2-container')
            
            if(!(sweetAlerts.length < 1)) {
              this.vcoConfig.isActive = false
            } else {
              if(this.isOnTerm === false) {
                this.vcoConfig.isActive = true
              }
            }

            if(this.isOnTerm === true) {
              this.isOnTerm = false
            }
          }, 100)
        } else {
          this.vcoConfig.isActive = true
        }
      } else {
        this.offVco()
      }
    },
    offVco() {
      this.vcoConfig.isActive = false
    },
    /**
     * // v-click-outside
     */
    movePost(post) {
      if(this.sectionMains) {
        this.sectionMains.find(v => v.type === "TAB").tabs.map(item => {
          const obj = item.contents.find(v => v.postId === post.postId)
          
          if(obj) {
            obj.titlePoint = post.board.boardName
            obj.postType = post.board.postType
          }
        })
      }

      this.post.boardId = post.board.boardId
      this.postItem.board.boardId = post.board.boardId
      this.postItem.board.boardName = post.board.boardName
      this.postItem.board.postType = post.board.postType
      this.postItem.board.isReadParents = post.board.isReadParents
      this.postItem.board.isReadStudent = post.board.isReadStudent
      this.postItem.pushTarget = post.pushTarget
      this.postItem.postType = post.board.postType
      this.postItem.board.isUsedFolder = post.board.isUsedFolder
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

      this.vcoConfig = {
        handler: this.handler,
        middleware: this.middleware,
        events: ['click'],
        isActive: true
      }
    },
    movePostClose() {
      this.vcoConfig.isActive = true
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
      this.$store.commit('setIsShowDetailPostLayer', false)
    }
  }
}
</script>

<style scoped></style>

<style lang="scss">
.item-cont-wrap {
  table th, table td {
    border: 1px solid black;
  }
}
</style>
