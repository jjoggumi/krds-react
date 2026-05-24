<!--
@File(Method): Comment.vue
@Description: 게시글 상세 댓글 (댓글/답글 등록 포함)
@Modified: 2025-03-07 - #72798 목록 내 스크롤바 영역 개선 요청 - 스크롤바 공통화
-->

<template>
  <div
    v-observe-visibility="
      isShowComment
      ? {
          callback: visibilityChanged,
          intersection: {
            threshold: 0.1,
          },
          once: true,
        }
      : false
    "
    class="hi-comment"
    :style="isShowCommentStyle"
  >
    <!-- 동적 컴포넌트 : 신고하기 모달팝업 -->
    <component
      :is="editMode"
      :content-types="contentTypes"
      :comment="items.reportComment"
      @is-result="reportCommentResult"
      :post-item-type="postItemType"
      :postType="postType"
    />
    <!-- 댓글 목록 -->

    <div
      v-if="items.commentItems.length > 0"
      class="comment__list"
    >

      <!-- 이전 댓글 더보기 -->
      <template v-if="searchComment === false">
        <button
          v-if="items.commentLimit > items.commentItems.length"
          class="btn-view-all"
          @click="getComment('more')"
        >
          <!-- 전체 댓글 펼쳐보기 -->
          이전 댓글 더보기
        </button>
      </template>

      <template v-else>
        <button 
          v-if="items.commentLimit > items.commentItems.length"
          class="btn-view-all"
          @click="getComment('total')"
        >
          전체 댓글 보기
        </button>
      </template>

      <!-- 댓글 목록 (parents) -->
      <comment-list-parent-item
        v-for="commentItem of items.commentItems"
        :key="commentItem.currentId"
        :item="commentItem"

        :childCommentCount="commentItem.childCommentCount"

        :post-id="postItem.currentId"
        :post-parent-id="postItem.parentId || postItem.parent.currentId"
        :post-write-user="postItem.writeUser"
        :content-types="contentTypes"
        :pos-write-comment="posWriteComment"
        :post-item-type="postItemType"
        :postType="postType"

        :isNotHiNotice="isNotHiNotice"
        :is-manager="isManager"
        :is-read-only="isReadOnly"
        :is-use-file-upload="isUseFileUpload"
        :is-use-sticker="isUseSticker"
        :is-report-use="isReportUse"
        :is-reply-use="isReplyUse"
        :isClassPost="isClassPost"
      />

    </div>

    <!-- 댓글/답글 작성하기 -->
    <div
      v-if="!isReadOnly"
      class="comment__register"
    >
      <!-- 댓글 첨부파일  -->
      <comment-file-upload
        v-if="isUseFileUpload && posWriteComment"
        :key="`comment-file-upload-${postItem.currentId}`"
        :files.sync="model.files"
        :is-add-files="isAddFiles"
        :is-add-sticker="isAddSticker"
        :isNotHiNotice="isNotHiNotice"
        :emoticonPath.sync="model.emoticonPath"
        :unusedFiles="unusedFiles"
        @removeS="removeS"
        @stickerClosePopup="stickerClosePopup"
      />

      <div class="comment__editor"
        :class="{
          'is-btn-attachment' : isUseFileUpload && posWriteComment
        }"
      >
        <!-- 내 프로필 사진 -->
        <comment-profile-thumbnail
          :is-my-profile-thumbnail="true"
          :isNotHiNotice="isClassPost"
          :postClassId="isClassPost ? postItem.parentId || postItem.parent.classId || postItem.parent.currentId : ''"
        />

        <div class="group-btn">
          <!-- 비밀 댓글 토글 -->
          <comment-secret
            v-if="isVisibleSecret"
            :model="model"
            :isClassPost="isClassPost"
          />
          <!-- 이모티콘 버튼 wrap -->
          <sticker-button
            ref="stickerButton"
            v-if="isUseSticker && posWriteComment"
            :files.sync="model.files"
            @setStickerItemUrl="setStickerItemUrl"
          />
        </div>

        <div
          v-if="model.parentCommentId"
          class="reply"
        >
          <span>{{ option.replyUserName }}</span>
          <button
            class="btn-delete"
            @click="setReplyMode(null, false)"
          ></button>
        </div>

        <!-- 댓글 작성 -->
        <comment-write-textarea
          ref="commentWriteTextarea"
          :comment.sync="model.comment"
          :emoticonPath="model.emoticonPath"
          :option="option"
          :pos-write-comment="posWriteComment"
        />

        <div class="attachment">
          <!-- 1/2 업로드한 첨부파일 -->
          <comment-write-file-wrap
            :files.sync="model.files"
            :imageEditorKey="`comment-file-upload-${postItem.currentId}`"
            :unusedFiles="unusedFiles"
          />
          <!-- 2/2 선택한 스티커 -->
          <div
            v-if="isAddSticker"
            class="emoticon"
          >
            <img :src="model.emoticonPath" alt="" />
            <button class="btn-delete" @click.stop="removeS()"></button>
          </div>
        </div>

      </div> <!-- end comment input -->

      <button
        class="btn-register"
        :class="{ dis: !isSave }"
        :disabled="!isSave"
        @click="setComment"
      >
        등록
      </button>

    </div>

  </div>
</template>

<script>
import CommentProfileThumbnail from "@/components/Card/footer/comment/CommentProfileThumbnail";
import CommentFileUpload from "@/components/Card/footer/comment/CommentFileUpload";
import CommentWriteTextarea from "@/components/Card/footer/comment/CommentWriteTextarea";
import CommentWriteFileWrap from "@/components/Card/footer/comment/CommentWriteFileWrap";
import CommentSecret from "@/components/Card/footer/comment/CommentSecret";
import CommentListParentItem from "@/components/Card/footer/comment/CommentListParentItem";

import ErrorLoadFailAsyncComponent from "@/apps/error/ErrorLoadFailAsyncComponent";
import {mapGetters, mapMutations, mapActions, mapState} from "vuex";
import {mapFields} from "vuex-map-fields";
import {eventBus} from "@/main";
import {ObserveVisibility} from "vue-observe-visibility";
import axios from "@/plugins/axios"

const CommentReport = () => ({
  component: import('@/components/Card/footer/comment/CommentReport'),
  error: ErrorLoadFailAsyncComponent,
})
const StickerWrap = () => ({
  component: import('@/components/Sticker/StickerWrap'),
  error: ErrorLoadFailAsyncComponent,
})
const StickerButton = () => ({
  component: import('@/components/Sticker/StickerButton'),
  error: ErrorLoadFailAsyncComponent,
})

export default {
  name: 'Comment',
  components: {
    CommentListParentItem,
    CommentWriteTextarea,
    CommentWriteFileWrap,
    CommentFileUpload,
    CommentProfileThumbnail,
    CommentSecret,
    CommentReport,
    StickerWrap,
    StickerButton,
  },
  directives: {ObserveVisibility},
  props: {
    /**
     * props: post item object
     * ( post | clazzesPost | schoolsPost | postHomeworkUsers )
     */
    postItem: {
      type: Object,
      required: true
    },
    /**
     * props: post item type
     * ( POST | CLAZZES_POST | SCHOOLS_POST | POST_HOMEWORK_USERS )
     */
    postItemType: {
      type: String,
    },
    postHomeworkUser: {
      type: Object,
    },
    comments: {
      type: Array,
    },
    isShowComment: {
      type: Boolean,
    },
    isManager: {
      type: Boolean,
      default() {
        return false
      }
    },
    isReadOnly: {
      type: Boolean,
      default() {
        return false
      }
    },
    isReplyUse: {
      type: Boolean,
      default() {
        return true
      }
    },
    isReportUse: {
      type: Boolean,
      default() {
        return true
      }
    },
    count: {
      type: Number
    },
    isUseSticker: {
      type: Boolean,
      default() {
        return true
      }
    },
    contentType: {
      type: String,
      default() {
        return 'post'
      }
    },
  },
  data() {
    return {
      subComponent: '',
      option: {
        isFirst: true,
        commentPlaceholder: '',
        replyUserName: ''
      },
      searchForm: {
        postId: null,
        depth: 0,
        del: false,
        page: 0,
        size: 2,
        sort: 'insertedTimestamp,desc'
      },
      items: {
        commentItems: [],
        commentLimit: 0,
        reportComment: null
      },
      addItem: {},
      delItem: {},
      model: {
        post: null,
        user: null,
        comment: '',
        emoticonPath: null,
        parentCommentId: '',
        parentCommentSecret: false,
        files: [],
        secret: false,
      },
      contentTypes: {
        methodName: String,
        reqParam: Object,
        countReqParam: Object
      },
      commentTimestampType: '',
      commentTotalCount: 0,
      searchComment: false,
      searchComments: [],
      searchCommentExist: false,
      regBtnAct: true,
      api: process.env.VUE_APP_BASE_API_URI,
      unusedFiles: []
    }
  },
  computed: {
    ...mapState({
      acceptedTermsPostIdList: 'acceptedTermsPostIdList',
      curClassSearchQuery: 'curClassSearchQuery',
    }),
    ...mapGetters({
      getUserTypeNameByCode: 'getUserTypeNameByCode',
    }),
    ...mapFields({
      isLoading: 'isLoading',
      isDimLoading: 'isDimLoading'
    }),
    pCount: {
      get() {
        return this.count
      },
      set(val) {
        this.$emit('update:count', val)
      }
    },
    isSave() {
      return !this.isFileProgress && (
        this.model.comment.trim() !== '' ||
        this.model.files.length > 0 ||
        this.isAddSticker
      ) && this.regBtnAct === true
    },
    isFileProgress() {
      // return this.model.files.length > 0 && this.model.files[0].progress
      return this.model.files.length > 0 && this.model.files.some(v => v.progress >= 0) === true
    },
    isAddFiles() {
      return this.model.files.length > 0
    },
    // fileList() {
    //   return this.model.files
    // },
    isAddSticker() {
      return (
        this.model.emoticonPath !== null &&
        this.model.emoticonPath.trim() !== ''
      )
    },
    isVisibleSecret() {
      return this.isNotHiNotice && !this.isPostHomeworkUserComment
    },
    editMode() {
      return this.subComponent
    },
    postType() {
      return this.postItem.postType
    },
    isNotHiNotice() {
      // return ['NOTE', 'ALBUM', 'BOARD', 'HOMEWORK', 'EVENT'].includes(this.postType)
      // return true
      return !['HINOTICE'].includes(this.postType)
    },
    isClassPost() {
      return ['NOTE', 'ALBUM', 'BOARD', 'HOMEWORK'].includes(this.postType)
    },
    isUseFileUpload() {
      return !!(this.isNotHiNotice && !this.isPostHomeworkUserComment)
    },
    isPostHomeworkUserComment() {
      return this.contentTypes.methodName === 'postHomeworkUserComments'
    },
    isShowCommentStyle() {
      return { display: this.isShowComment ? 'block': 'none' }
    },
    posWriteComment() {
      if (this.postType === 'EVENT') {
        if(!this.commentTimestampType === true) {
          return this.postItem.displayStatus !== 'CLOSED' || this.postItem.displayStatus === 'PROGRESSING'
        } else {
          return (this.commentTimestampType === 'POSTED_EVENTEND' && this.postItem.displayStatus !== 'CLOSED')
          || (this.commentTimestampType === 'EVENTSTART_EVENTEND' && this.postItem.displayStatus === 'PROGRESSING');
        }
      }

      return true;
    },
  },
  created() {
    // this.searchForm._post = this.postItem._links.self.href
    this.searchForm.postId = this.postItem.currentId
    this.model.post = this.postItem._links.self.href
    this.model.user = this.$store.state.userUri
    this.commentTotalCount = this.postItem.commentCount
  },
  async mounted() {
    // 과제 분기 처리
    await this.setContentType()
      .then(() => {
        // // 클래스 > 게시글 목록에 노출
        // if (Array.isArray(this.comments)) {
        //   this.items.commentItems.push(...this.comments)
        // } else {
        //   // 상세보기로 노출
        //   this.getComment('add')
        // }

        // 상세보기로 노출
        // this.getComment('add')
      })

    if(this.curClassSearchQuery.keyword && this.postItem.comments.length > 0) {
      this.searchCommentExist = true
    }

    eventBus.$on(`get-comment-by-post-id|${this.postItem.currentId}`,moreType => {
      setTimeout(() => {
        this.getComment(moreType)
      },300)
    })
    eventBus.$on(`set-comment-by-post-id|${this.postItem.currentId}`,() => {
      this.setComment()
    })
    eventBus.$on(`${this.postItemType}-delete-comment-by-post-id|${this.postItem.currentId}`,item => {
      this.deleteComment(item)
    })
    eventBus.$on(`${this.postItemType}-report-comment-by-post-id|${this.postItem.currentId}`,item => {
      this.reportComment(item)
    })
    eventBus.$on(`${this.postItemType}-set-reply-mode-by-post-id|${this.postItem.currentId}`,(item, bool) => {
      this.$log.debug(this.$options.name, `${this.postItemType}-set-reply-mode-by-post-id|${this.postItem.currentId}`, item, bool)
      this.setReplyMode(item, bool)
    })
    eventBus.$on(`${this.postItemType}-get-reply-by-post-id|${this.postItem.currentId}`,parentId => {
      this.getReply(parentId)
    })
    eventBus.$on(`${this.postItemType}-init-comment-list-by-post-id|${this.postItem.currentId}`, () => {
      this.initCommentList()
    })
    eventBus.$on(`${this.postItemType}-focus-write-comment-area-by-post-id|${this.postItem.currentId}`, () => {
      const commentWriteTextareaWrap = this.$refs.commentWriteTextarea
      if (commentWriteTextareaWrap && commentWriteTextareaWrap.$refs.textarea) {
        commentWriteTextareaWrap.$refs.textarea.focus()

        // 게시글 상세 레이어 > 댓글 작성 비활성화 상태에서 댓글 버튼 클릭 시 댓글 영역으로 이동하도록 처리
        if (commentWriteTextareaWrap.$refs.textarea.disabled) {
          const options = {
            container: 'div.modal-cont-wrap',
            easing: 'ease-in',
            lazy: false,
            offset: -60,
            force: true,
            cancelable: false,
            x: false,
            y: true
          }
          this.$scrollTo(commentWriteTextareaWrap.$refs.textarea, 0, options)
        }
      }
    })
    eventBus.$on(`set-comment-timestamp-type-by-post-id|${this.postItem.currentId}`, commentTimestampType => {
      this.$log.debug(this.$options.name, `set-comment-timestamp-type-by-post-id|${this.postItem.currentId}`, commentTimestampType)
      this.commentTimestampType = commentTimestampType
    })
  },
  beforeDestroy() {
    eventBus.$off(`get-comment-by-post-id|${this.postItem.currentId}`)
    eventBus.$off(`set-comment-by-post-id|${this.postItem.currentId}`)
    eventBus.$off(`${this.postItemType}-delete-comment-by-post-id|${this.postItem.currentId}`)
    eventBus.$off(`${this.postItemType}-report-comment-by-post-id|${this.postItem.currentId}`)
    eventBus.$off(`${this.postItemType}-set-reply-mode-by-post-id|${this.postItem.currentId}`)
    eventBus.$off(`${this.postItemType}-get-reply-by-post-id|${this.postItem.currentId}`)
    eventBus.$off(`${this.postItemType}-init-comment-list-by-post-id|${this.postItem.currentId}`)
    eventBus.$off(`${this.postItemType}-focus-write-comment-area-by-post-id|${this.postItem.currentId}`)
    eventBus.$off(`set-comment-timestamp-type-by-post-id|${this.postItem.currentId}`)

    const list = this.acceptedTermsPostIdList
    const curPostIndex = list.findIndex(postId => postId === this.postItem.currentId)
    if (curPostIndex > -1) {
      list.splice(curPostIndex, 1)
      this.setAcceptedTermsPostIdList(list)
    }
  },
  methods: {
    ...mapMutations({
      setAcceptedTermsPostIdList: 'setAcceptedTermsPostIdList',
      setCurPostTerms: 'setCurPostTerms',
    }),
    ...mapActions({
      isAllDeviceLogout: 'isAllDeviceLogout'
    }),
    setContentType() {
      return new Promise(resolve => {
        switch (this.contentType) {
          case 'post': {
            this.contentTypes.methodName = 'postComments'
            this.contentTypes.reqParam = this.searchForm
            // this.contentTypes.countReqParam = {
            //   _post: this.postItem._links.self.href,
            //   _del: false
            // }
            this.contentTypes.countReqParam = {
              postId: this.postItem.currentId
            }

            this.option.commentPlaceholder = this.$t('main.text.comment.placeholder')
            break
          }
          case 'postHomework': {
            const postHomeworkUserUrl = this.postHomeworkUser._links.self.href
            const workId = this.postHomeworkUser.currentId

            this.contentTypes.methodName = 'postHomeworkUserComments'
            this.contentTypes.reqParam = {
              postHomeworkUser: postHomeworkUserUrl,
              workId: workId,
              sort: ['insertedTimestamp,desc']
            }
            this.contentTypes.countReqParam = {
              postHomeworkUser: postHomeworkUserUrl,
              workId: workId
            }
            this.model['postHomeworkUser'] = postHomeworkUserUrl // 댓글 저장용 추가
            this.option.commentPlaceholder = this.$t('main.text.homeworkUserComment.placeholder')
            break
          }
        }

        resolve(true)
      })
    },
    /**
     * 댓글 가져오기
     * @param moreType {String} more:더보기 , add:추가
     */
    async getComment(moreType) {
      switch (moreType) {
        case 'more': {
          let maxSize = 50
          while (this.items.commentItems.length >= maxSize) {
            maxSize = maxSize + 50
          }
          // 게시글 댓글 개수 증가
          this.searchForm.size = maxSize
          // 제출한 과제 댓글 개수 증가
          this.contentTypes.reqParam['size'] = maxSize
          // more 로딩
          this.isLoading = true
          break
        }
        case 'add': {
          //if(!(Object.keys(this.addItem).length > 0 && this.searchForm.size === 3)) {
            this.searchForm.size++
          //}
          break
        }
        case 'add2': {
          this.searchForm.size++
          break
        }
        case 'del': {
          if(Object.keys(this.delItem).length > 0) {
            this.searchForm.size++
          }
          break
        }
        default: {
          // 현 사이즈 유지
        }
      }

      try {
        if(this.searchCommentExist === true && moreType !== 'total') {

          if(this.searchComment === true || moreType === 'add_exist' || moreType === "del") {
            this.contentTypes.reqParam.size = this.contentTypes.reqParam.size + 1
            const res = await this.$hiClass[this.contentTypes.methodName].search(this.contentTypes.reqParam)
            this.items.commentItems = []
            this.items.commentLimit = res.data.page.totalElements

            let list = []
            if(moreType === "del") {
              const index = res.data._embedded[this.contentTypes.methodName].findIndex(v => v.currentId === this.delItem.currentId)
              
              if(index > -1) {
                list = res.data._embedded[this.contentTypes.methodName].filter(v => v.currentId !== this.delItem.currentId)
                this.items.commentLimit = this.items.commentLimit - 1
              } else {
                list = res.data._embedded[this.contentTypes.methodName]
                if(list.length >= this.searchForm.size) list.pop()
              }
              
              this.items.commentLimit = this.items.commentLimit - 1
            } else {
              if(Object.keys(this.addItem).length > 0) {
                const index = res.data._embedded[this.contentTypes.methodName].findIndex(v => v.currentId === this.addItem.currentId)
                
                if(index > -1) {
                  list = res.data._embedded[this.contentTypes.methodName]
                } else {
                  list = res.data._embedded[this.contentTypes.methodName].filter(v => v.currentId !== this.addItem.currentId)
                  if(list.length >= this.searchForm.size) {
                    list.pop()
                  } 
                  list.unshift(this.addItem)
                  // this.items.commentLimit = this.items.commentLimit + 1
                }
              } else {
                list = res.data._embedded[this.contentTypes.methodName]
              }
            }

            this.items.commentItems = list
              .reverse()
              .map(item => {
                item.files = item.files || []
                // 화면에서 답글 제어를 위한 flag 세팅
                item.isChildComment = item.isChildComment || false
                item.childComment = item.childComment || []
                item.isShowReply = false
                return item
              })

            this.addItem = {}
            this.delItem = {}
          } else {
            // 댓글 존재시 초기로딩
            this.contentTypes.reqParam.size = this.commentTotalCount
            const res = await this.$hiClass[this.contentTypes.methodName].search(this.contentTypes.reqParam)
            const list = res.data._embedded[this.contentTypes.methodName]
            this.searchComments = this.postItem.comments
            this.items.commentItems = list.filter(item => this.searchComments.findIndex(v => v.currentId === item.currentId) > -1).reverse()
              .map(item => {
                item.files = item.files || []
                // 화면에서 답글 제어를 위한 flag 세팅
                item.isChildComment = item.isChildComment || false
                item.childComment = item.childComment || []
                item.isShowReply = false
                return item
              })
              
            this.items.commentLimit = list.length
            this.searchComment = true
          }
        } else {
          const res = await this.$hiClass[this.contentTypes.methodName].search(this.contentTypes.reqParam)
          this.items.commentItems = []
          this.items.commentLimit = res.data.page.totalElements

          this.$log.debug("res => ", this.contentTypes.methodName, res)
          
          let list = []
          if(moreType === "del") {
            const index = res.data._embedded[this.contentTypes.methodName].findIndex(v => v.currentId === this.delItem.currentId)
            
            if(index > -1) {
              list = res.data._embedded[this.contentTypes.methodName].filter(v => v.currentId !== this.delItem.currentId)
              this.items.commentLimit = this.items.commentLimit - 1
            } else {
              list = res.data._embedded[this.contentTypes.methodName]
              if(list.length >= this.searchForm.size) list.pop()
            }
            
            this.searchForm.size--
          } else {
            if(Object.keys(this.addItem).length > 0) {
              const index = res.data._embedded[this.contentTypes.methodName].findIndex(v => v.currentId === this.addItem.currentId)
              
              if(index > -1) {
                list = res.data._embedded[this.contentTypes.methodName]
              } else {
                list = res.data._embedded[this.contentTypes.methodName].filter(v => v.currentId !== this.addItem.currentId)
                if(list.length >= this.searchForm.size) {
                  list.pop()
                } 
                this.items.commentLimit = this.items.commentLimit + 1
                list.unshift(this.addItem)
              }
            } else {
              list = res.data._embedded[this.contentTypes.methodName]
            }
          }
          
          this.items.commentItems = list
            .reverse()
            .map(item => {
              item.files = item.files || []
              // 화면에서 답글 제어를 위한 flag 세팅
              item.isChildComment = item.isChildComment || false
              item.childComment = item.childComment || []
              item.isShowReply = false
              return item
            })
          this.searchComment = false
          this.addItem = {}
          this.delItem = {}

          // if(moreType === "add2") this.searchForm.size++
        }

        this.$log.debug("this.items.commentItems", this.items.commentItems)
      } catch (err) {
          this.$log.debug(this.$options.name, ' getComment() error => ', err)
      } finally {
        this.getCommentCount()
        this.isLoading = false      
      }
    },
    async getCommentCount() {
      // this.$hiClass[this.contentTypes.methodName]
      //   .search(this.contentTypes.countReqParam)
      //   .then(res => {
      //     this.pCount = res.data.page.totalElements
      //   })
      //   .catch(err => {
      //     this.$log.debug(
      //       this.$options.name,
      //       ' getCommentCount() error => ',
      //       err
      //     )
      //   })

      try {
        // const res = await this.$hiClass[this.contentTypes.methodName].search(this.contentTypes.countReqParam)
        // this.pCount = res.data.page.totalElements

        // if(this.searchComment === false) {
        //   this.pCount = this.items.commentLimit
        // } else {
        //   this.pCount = this.items.commentItems.length
        // }

        // this.pCount = this.items.commentLimit

        if(this.isPostHomeworkUserComment === false) {
          const res = await this.$axios({
            method: 'GET',
            url: `/posts/${this.postItem.currentId}/comment/count`,
          })

          this.pCount = res.data.count
        }
      } catch (err) {
        this.$log.debug(
          this.$options.name,
          ' getCommentCount() error => ',
          err
        )
      }
    },
    // 댓글 저장 초기화
    initCommentList() {
      this.getComment('del')

      this.model.parentCommentId = ''
      this.model.parentCommentSecret = false
      this.model.comment = ''
      this.removeS() // Selected 스티커 삭제
      this.model.secret = false
      this.removeA() // Selected 업로드 파일 삭제
    },
    // 댓글 저장
    async setComment() {
      this.isDimLoading = true
      const deviceRes = await this.isAllDeviceLogout(true)
      if(deviceRes) {
        this.isDimLoading = false
        return false;
      }
      let eventAgreed = true

      if(this.postItem.postType === "EVENT") {
   
        const url = `postComments/post/${this.postItem.currentId}/check/${this.$store.state.user.currentId}`
        const wCheckRes = await axios({
          method: 'GET',
          url: `${this.api}/${url}`,
        })

        if(wCheckRes.data.over === true) {
          this.$hiClass.alert('댓글을 최대 3번까지 등록이 가능합니다.', 'warning')
          this.isDimLoading = false
          return
        }

        eventAgreed = wCheckRes.data.isNeedTerms
      }


      // 일반 게시글(post)만 postOptions 값 확인, 제출과제 게시글(postHomework)에는 postOptions 값 없음
      const postOptions = this.postItem.postOptions

      if (Array.isArray(postOptions)) {
        const termsObj = postOptions.find(o => o.name === 'terms')
        const postId = this.postItem.currentId
        const isAccepted = this.acceptedTermsPostIdList.includes(postId)

        this.$log.debug(this.$options.name, 'termsObj, isAccepted:', termsObj, isAccepted)

        if (termsObj && termsObj.value === 'true' && !isAccepted && eventAgreed === true) {
          const payload = {
            isOpen: true,
            postId,
            postOptions
          }
          this.setCurPostTerms(payload)
          this.isDimLoading = false
          return false
        }
      }

      // 첨부파일 확인
      if (this.model.files && this.model.files.length > 0) {
        const unAvailableFile = this.model.files.find(f => !f.fileOriginalPath)
        if (unAvailableFile) {
          this.$hiClass.alert('잘못된 첨부파일이 포함되어 있습니다.<br>다시 한번 확인해주세요.', 'warning')
          this.isDimLoading = false
          return false
        }

        // 동영상 인코딩: 수정 시 기존에 등록되었던 동영상은 인코딩 요청 안함 (seq로 판단)
        const newVideoFiles = this.model.files.filter(file => file.fileContentType.startsWith('video') && !file.seq)
        if (newVideoFiles.length > 0) {
          for (let i = 0; i < newVideoFiles.length; i++) {
            try {
              const encodeRes = await this.$hiClass.multipart.encode({
                fileOriginalPath: newVideoFiles[i].fileOriginalPath
              })
              const requestId = encodeRes.data.requestId
              if (requestId) {
                newVideoFiles[i].requestId = requestId
              }
            } catch (e) {
              // 인코딩 실패해도 무시하고 등록
            }
          }
        }
      }

      try {
        const res = await axios({
          method: 'POST',
          url: `${this.api}/${this.contentTypes.methodName}`,
          data: this.model
        })

        if (res) {
          this.deleteUnusedFiles()
          this.addItem = res.data

          if (this.model.parentCommentId === '') {
            // 댓글
            if(this.searchCommentExist === true) {
              this.getComment('add_exist')
            } else {
              this.getComment('add2')
            }
          } else {
            // 답글
            this.getReply(this.model.parentCommentId)
          }

          this.regBtnAct = false
          setTimeout(() => {
            this.regBtnAct = true
          }, 500);
        }
      } catch (err) {
        this.$log.debug(this.$options.name, ' setComment() error => ', err)
        // console.log("err.response.status", err.response.status)
        
        if(err.response) {
          switch (err.response.status) {
            case 404: {
              this.$hiClass.alert('삭제된 게시글입니다.', 'warning')
                  .then(() => {
                    eventBus.$emit('refresh-class-board-posts')
                  })
              break
            }
            case 406: {
              this.$hiClass.alert('미구독 클래스입니다.', 'warning')
                .then(() => {
                  // 메인으로 이동 및 상세 팝업 닫기
                  this.$store.commit('setItemDetailObj', {})
                  this.$store.commit('setIsShowDetailPostLayer', false)
                  this.$router.push('/', () => {})
                })
              break
            }
            case 413: {
              this.$hiClass.alert('게시글 당 작성 가능한 댓글 개수를<br/>초과하여 등록할 수 없습니다.', 'warning')
              break
            }
            case 416: {
              this.$hiClass.alert('이미 종료된 이벤트입니다.', 'warning')
              break
            }
            case 428: {
              this.$hiClass.alert('삭제된 댓글에는 답글 작성이 불가합니다.', 'warning')
                .then(() => {
                  this.initCommentList()
                })
              break
            }
          }
        } else {
          this.$hiClass.alert(this.$t('main.text.error.comment'), 'error')
        }
      } finally {
        this.model.parentCommentId = ''
        this.model.parentCommentSecret = false
        this.model.comment = ''
        this.removeS() // Selected 스티커 삭제
        this.model.secret = false
        this.removeA() // Selected 업로드 파일 삭제
        this.isDimLoading = false
      }
    },
    deleteUnusedFiles() {
      let deleteApi = []
      this.unusedFiles.forEach(file => {
        deleteApi.push(this.$hiClass.multipart.delete(file))
      })
      Promise.all(deleteApi)
          .then(() => {
            this.unusedFiles = []
          })
    },
    setReplyMode(item, bool) {
      if (bool) {
        this.model.parentCommentId = item.currentId
        this.model.parentCommentSecret = item.secret
        this.model.comment = ''
        this.removeS() // Selected 스티커 삭제
        this.model.secret = item.secret
        this.option.replyUserName = this.getUserName(item)
        // this.option.commentPlaceholder = `${this.getUserName(item)}님에게 답글 작성 중...`

        if (this.$refs.commentWriteTextarea) {
          this.$refs.commentWriteTextarea.doFocusTextarea()
        }

      } else {
        this.model.parentCommentId = ''
        this.model.parentCommentSecret = false
        this.model.comment = ''
        this.removeS() // Selected 스티커 삭제
        this.model.secret = false
      }
      this.removeA()
    },
    async getReply(parentId) {
      // console.log("getReply", parentId, this.addItem)
      const methodName = this.contentTypes.methodName

      // this.$hiClass[methodName]
      //   .search({
      //     _parentCommentId: parentId,
      //     _post: this.postItem._links.self.href,
      //     _del: false,
      //     sort: 'insertedTimestamp,desc'
      //   })
      //   .then(res => {
      //     const parentData = this.items.commentItems.find(item => {
      //       return item.currentId === parentId
      //     })

      //     parentData.childComment = []

      //     const resources = res.data._embedded[methodName]
      //     resources.reverse().map(item => {
      //       parentData.childComment.push(item)
      //     })

      //     parentData.isChildComment = true
      //     parentData.childCommentCount = res.data.page.totalElements
      //   })
      //   .catch(err => {
      //     this.$log.debug(this.$options.name, ' getReply() error => ', err)
      //   })
      //   .finally(() => {
      //     this.getCommentCount()
      //   })
      
      try {
        let obj = {}
        if(methodName === 'postComments') {
          obj = {
            parentCommentId: parentId,
            postId: this.postItem.currentId,
            sort: 'insertedTimestamp,desc'
          }
        } else {
          obj = {
            _parentCommentId: parentId,
            _post: this.postItem._links.self.href,
            sort: 'insertedTimestamp,desc'
          }
        }

        const res = await this.$hiClass[methodName].search(obj)
        const parentData = this.items.commentItems.find(item => {
          return item.currentId === parentId
        })
        
        parentData.childComment = []

        let resources = res.data._embedded[methodName]
        // const resources = res.data._embedded[methodName]
        let addChildCommentCount = 0
        if(Object.keys(this.addItem).length > 0) {
          const index = resources.findIndex(v => v.currentId === this.addItem.currentId)
          if(!(index > -1)) {
            resources.unshift(this.addItem)
            addChildCommentCount = 1
          }
        }

        if(Object.keys(this.delItem).length > 0) {
          const index = resources.findIndex(v => v.currentId === this.delItem.currentId)

          if(index > -1) {
            resources = resources.filter(v => v.currentId !== this.delItem.currentId)
            addChildCommentCount = -1
          }
        }
        parentData.childComment = resources.reverse().map(item => item)
        parentData.isChildComment = true
        parentData.childCommentCount = res.data.page.totalElements + addChildCommentCount
        parentData.isShowReply = true
        this.addItem = {}
        this.delItem = {}

        this.getCommentCount()
      } catch (err) {
        this.$log.debug(this.$options.name, ' getReply() error => ', err)
      }
    },
    deleteComment(item) {
      this.$hiClass.confirm('삭제 하시겠습니까?')
        .then(async() => {
          // this.$hiClass[this.contentTypes.methodName]
          //   .update(Object.assign(item, { del: true }))
          //   .then(() => {
          //     !item.parentCommentId
          //       ? this.getComment('del')         // 댓글
          //       : this.getReply(item.parentCommentId)   // 답글

          //     this.model.parentCommentId = ''
          //     this.model.parentCommentSecret = false
          //     this.model.comment = ''
          //     this.removeS() // Selected 스티커 삭제
          //   })
          //   .catch(err => {
          //     switch (err.response.status) {
          //       case 404: {
          //         this.$hiClass.alert('삭제된 게시글입니다.', 'warning')
          //             .then(() => {
          //               eventBus.$emit('refresh-class-board-posts')
          //             })
          //         break
          //       }
          //     }
          //     this.$log.debug(this.$options.name,'deleteComment() error => ', err)
          //   })

          try {
            // console.log("this.contentTypes.methodName", this.contentTypes.methodName, item)
            const obj = {
              ...JSON.parse(JSON.stringify(item)), 
              _links : {
                self : {
                  href : `${this.$apiUrl}/${this.contentTypes.methodName}/${item.currentId}`
                }
              }
            }
            
            const res = await this.$hiClass[this.contentTypes.methodName].update(Object.assign(obj, { del: true }))
            
            this.delItem = item
            !item.parentCommentId
                ? this.getComment('del')         // 댓글
                : this.getReply(item.parentCommentId)   // 답글

            //this.model.parentCommentId = ''
            //this.model.parentCommentSecret = false
            //this.model.comment = ''
            //this.removeS() // Selected 스티커 삭제
          } catch (err) {
            switch (err.response.status) {
              case 404: {
                this.$hiClass.alert('삭제된 게시글입니다.', 'warning')
                    .then(() => {
                      eventBus.$emit('refresh-class-board-posts')
                    })
                break
              }
            }
            this.$log.debug(this.$options.name,'deleteComment() error => ', err)
          }

        })
    },
    reportComment(item) {
      this.subComponent = ''
      this.items.reportComment = item

      this.$nextTick(() => {
        this.subComponent = 'CommentReport'
      })
    },
    reportCommentResult(data) {
      this.subComponent = ''
      // 신고 후 후속 조치는 없음

      // 신고 후 리스트 갱신 
      if(data === 'finish' && this.postType === "EVENT") {
        if(this.items.reportComment.depth > 0) {
          this.getReply(this.items.reportComment.parentCommentId)
        } else {
          this.getComment('')
        }
      }
    },
    getUserName(item) {
      let userName = item.writeUser.userName
      
      if(!item.writeUser.userName === true) userName = "알수없음"
      // if (item.user.userStatus === 'DEACTIVATE')
      //   userName = '탈퇴회원'

      return userName
    },
    getWriteUserName(item) {
      if (item.writeUser) {
        let user = item.writeUser.userName + ' '
        const memberRole = item.writeUser.memberRole
        const userTypeName = this.getUserTypeNameByCode({code: item.writeUser.userType})
        const memberChildName = item.writeUser.memberChildName || '탈퇴회원'

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
        return user

      } else {
        return ''
      }
    },
    removeA() {
      // this.model.files.splice(0, 1)
      // console.log("removeA", this.model.files)
      this.model.files = []
    },
    removeS() {
      this.model.emoticonPath = null
    },
    setStickerItemUrl(url) {
      this.model.emoticonPath = url
    },
    visibilityChanged(isVisible, entry) {
      // 게시글 영역 노출되었을 때 댓글 불러오기 (1회)
      // this.$log.debug(this.$options.name, 'visibilityChanged: ', `this.getComment('add')`)
      switch (this.contentType) {
        case 'post': {
          if (isVisible && this.postItem.commentCount > 0) this.getComment('add')
          break
        }
        case 'postHomework': {
          if (isVisible) this.getComment('add')
          break
        }
      }
    },
    stickerClosePopup() {
      this.$refs.stickerButton.closePopup()
    }
  }
}
</script>
<style land="scss">
/* comment */
.hi-comment .image {
    background: url("~@/assets/img/icon/profile_default.png") no-repeat;
    background-size: 100%;
    border: 1px solid #ececec;
}
.hi-comment .btn-view-all {
    display: inline-block;
    color: var(--primary);
    font-size: 16px;
    font-weight: 500;
    line-height: 1.5;
    margin-top: 24px;
}
.hi-comment .btn-view-all::before {
    content: "";
    display: inline-block;
    width: 18px;
    height: 18px;
    background: url("~@/assets/img/icon/icons_comment.png") -20px -20px/100px auto no-repeat;
    vertical-align: middle;
    margin-top: -4px;
}
.hi-comment .comment__list { padding: 0 24px;border-top: 1px solid #e0e0e0; }
.hi-comment .comment__list .nodata { padding: 24px 0 20px; }
.hi-comment .comment__list .nodata p {
    color: #616161;
    font-size: 15px;
    line-height: 1.5;
 }
.hi-comment .comment__item:not(:last-of-type) { border-bottom: 1px solid #ececec; }
.hi-comment .hi-kebabmenu { top: 24px;right: 0; }
.hi-comment .hi-kebabmenu .btn-kebab:not(.is-active) span { background-color: #9e9e9e; }
.hi-comment .comment__content {
    position: relative;
    padding: 24px 0;
    padding-left: 46px;
}
.hi-comment .comment__info { position: relative; }
.hi-comment .comment__info .image {
    overflow: hidden;
    position: absolute;
    left: -46px;
    width: 36px;
    padding-top: 36px;
    border-radius: 50%;
}
.hi-comment .comment__info .image img {
    position: absolute;
    top: 50%;
    left: 50%;
    width: auto;
    min-width: 100%;
    height: 100%;
    background-color: #fff;
    transform: translate(-50%,-50%);
    -webkit-transform: translate(-50%,-50%);
    object-fit: cover;
    image-rendering: auto;
}
.hi-comment .comment__info .name {
    display: inline-block;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.5;
    vertical-align: middle;
}
.hi-comment .comment__info .label.me {
    display: inline-block;
    width: 36px;
    height: 18px;
    color: var(--primary);
    font-size: 10px;
    font-weight: 500;
    text-align: center;
    line-height: 16px;
    border: 1px solid var(--primary);
    border-radius: 18px;
    margin-left: 4px;
    vertical-align: middle;
}
.hi-comment .comment__info .date {
    display: block;
    color: #9e9e9e;
    font-size: 12px;
    font-weight: 400;
    line-height: 1.5;
}
.hi-comment .comment__con.secret {
    position: relative;
    padding-left:20px;
}
.hi-comment .comment__con.secret::before {
  content: "";
  position: absolute;
  left: 0;
  top: 2px;
  display: block;
  width: 18px;
  height: 18px;
  background: url("~@/assets/img/icon/icons_comment.png") 0 -20px/100px auto no-repeat;
}
.hi-comment .comment__con.secret::after {display: none;}
.hi-comment .text { margin-top: 8px; }
.hi-comment .text.secret {
    position: relative;
    min-height: 22px;
    padding-left: 20px;
}
.hi-comment .text.secret::before {
    content: "";
    position: absolute;
    left: 0;
    top: 2px;
    display: block;
    width: 18px;
    height: 18px;
    background: url("~@/assets/img/icon/icons_comment.png") 0 -20px/100px auto no-repeat;
}
.hi-comment .text pre {
    font-size: 15px;
    font-weight: 400;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-all;
}
.hi-comment .text pre a {
    color: #5585ff;
    font-weight: 400;
    text-decoration: underline;
    line-height: 1.5;
}
.hi-comment .attendancelinker, .hi-comment .autolinker {
    display: inline;
}
.hi-comment .text .text-edited,
.hi-comment .emoticon .text-edited {
    color: #bdbdbd;
    font-size: 12px;
    padding-left: 4px;
}
.hi-comment .group-btn { 
    margin-top: 10px; 
    display: flex;
    align-items: center;
}
.hi-comment .group-btn .btn-reply {
    display: inline-block;
    height: 28px;
    color: #9e9e9e;
    font-size: 12px;
    font-weight: 500;
    line-height: 26px;
    padding: 4px 8px 4px 6px;
    border-radius: 28px;
    border: 1px solid #ccc;
    /* margin-right: 6px; */
}
.hi-comment .group-btn .btn-reply.view {
    width: 88px;
    border: 0;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    font-size: 13px;
    font-weight: 500;
    color: var(--primary);
}
.hi-comment .group-btn .btn-reply.view i.arrow {
    display: inline-block;
    width: 18px;
    height: 18px;
    background: url("~@/assets/img/icon/icon_arrow_down.png") center no-repeat;
}
.hi-comment .group-btn .btn-reply.view.open i.arrow {
    transform: rotate(180deg);
}
.hi-comment .group-btn .btn-reply.write {
    width: 56px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
.hi-comment .group-btn .btn-reply.write i.comment-write {
    margin-right: 2px;
}
.hi-comment .group-btn .btn-reply.write:hover {
    color: #333333;
}
.hi-comment .group-btn .btn-reply.write:hover i.comment-write {
    background: url("~@/assets/img/icon/icon_comment_write_on.png") center no-repeat;
}
.hi-comment .group-btn .btn-reply.reaction {
    width: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
}
.hi-comment .group-btn .btn-reply.reaction i.reaction {
    display: inline-block;
    width: 18px;
    height: 18px;
    background: url("~@/assets/img/icon/icon_emoticon_add.png") center no-repeat;   
}
.hi-comment .group-btn .btn-reply.reaction:not(.show):hover i.reaction {
    background: url("~@/assets/img/icon/icon_emoticon_add_on.png") center no-repeat;   
}
.hi-comment .group-btn .btn-reply.reaction .reaction-select {
    position: absolute;
    width: 324px;
    height: 50px;
    border: 1px solid #E0E0E0;
    border-radius: 100px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    left: -100%;
    top: calc(100% + 4px);
    background: #fff;
    z-index: 9999;
    box-shadow: 0px 3px 4px 0px rgba(0, 0, 0, 0.21);
}
.hi-comment .group-btn .btn-reply.reaction .reaction-select span {
    display: inline-flex;
    width: 34px;
    height: 34px;
    padding: 5px;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
    justify-content: center;
    align-items: center;
}
.hi-comment .group-btn .btn-reply.reaction .reaction-select span:hover {
    background: #EEEEEE;
}
.hi-comment .group-btn .btn-reply.reaction .reaction-select span.my {
    background: #F5F6F7;
}
.hi-comment .group-btn .reaction-list {
    width: auto;
    /* margin-right: 6px; */
    display: flex;
    align-items: center;
    gap: 4px;
}
.hi-comment .group-btn .reaction-list span {
    display: inline-flex;
    position: relative;
    width: 49px;
    height: 28px;
    border-radius: 24px;
    align-items: center;
    justify-content: center;
    gap: 2px;
    font-size: 12px;
    font-weight: 400;
    cursor: pointer;
}
.hi-comment .group-btn .reaction-list span i {
    margin-right: 2px;
}

.hi-comment .group-btn .reaction-list span.check, 
.hi-comment .group-btn .reaction-list span.ok,
.hi-comment .group-btn .reaction-list span.no, 
.hi-comment .group-btn .reaction-list span.like, 
.hi-comment .group-btn .reaction-list span.heart,
.hi-comment .group-btn .reaction-list span.joy,
.hi-comment .group-btn .reaction-list span.sad,
.hi-comment .group-btn .reaction-list span.surprise {
    background: #EEE;
    color: #666666;
    /* margin-left: 6px; */
}
.hi-comment .group-btn .reaction-list span.check.my, 
.hi-comment .group-btn .reaction-list span.ok.my,
.hi-comment .group-btn .reaction-list span.no.my, 
.hi-comment .group-btn .reaction-list span.like.my, 
.hi-comment .group-btn .reaction-list span.heart.my,
.hi-comment .group-btn .reaction-list span.joy.my,
.hi-comment .group-btn .reaction-list span.sad.my,
.hi-comment .group-btn .reaction-list span.surprise.my {
    background: #4778DE1A;
    border: 1px solid var(--primary);
    color: var(--primary);
}
.hi-comment .group-btn .reaction-list span:first-child {
    margin-left: 0;
}
.hi-comment .group-btn .reaction-list span i {
    background-size: cover;
}
.hi-comment .group-btn .reaction-list span.check i,
.hi-comment .group-btn .reaction-list span.ok i,
.hi-comment .group-btn .reaction-list span.no i,
.hi-comment .group-btn .reaction-list span.like i,
.hi-comment .group-btn .reaction-list span.joy i,
.hi-comment .group-btn .reaction-list span.sad i,
.hi-comment .group-btn .reaction-list span.surprise i {
    width: 16px;
    height: 16px;
}
.hi-comment .group-btn .reaction-list span.heart i {
    width: 15px;
    height: 13.5px;
}
.hi-comment .group-btn .reaction-list span span.reaction-peoples {
    position: absolute;
    top: calc(100%);
    left: 50%;
    transform: translateX(-50%);
    width: 139px;
    height: 40px;
    visibility: hidden;
    display: block;
    z-index: 9999;
}
.hi-comment .group-btn .reaction-list span span.reaction-peoples span.empty {
    width: 139px;
    height: 4px;
    display: block;
}
.hi-comment .group-btn .reaction-list span span.reaction-peoples span.text {
    width: 139px;
    height: 36px;
    display: block;
    background: #000000E5;
    border-radius: 6px;
    text-align: center;
    color: #fff;
    font-size: 13px;
    font-weight: 400;
    line-height: 36px;
    margin: 0;
    padding: 0;
}
.hi-comment .group-btn .reaction-list span:hover span.reaction-peoples {
    visibility: visible;
}
.hi-comment .emoticon,
.hi-comment .photo,
.hi-comment .btn-file,
.hi-comment .video { margin-top: 8px; }
.hi-comment .emoticon img {
    width: 100px;
    height: 100px;    
}

/* 대댓글 아이콘 수정 start */
.hi-comment .group-btn {
    width: auto;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
}
.hi-comment .group-btn .btn-reply.write.mr-0 {
  margin-right: 0;
}
.hi-comment .group-btn .comm-icon {
    display: inline-flex;
    position: relative;
    width: 49px;
    height: 28px;
    border-radius: 24px;
    align-items: center;
    justify-content: center;
    gap: 2px;
    font-size: 12px;
    font-weight: 400;
    cursor: pointer;
}
.hi-comment .group-btn .comm-icon i {
    margin-right: 2px;
}

.hi-comment .group-btn .comm-icon.check, 
.hi-comment .group-btn .comm-icon.ok,
.hi-comment .group-btn .comm-icon.no, 
.hi-comment .group-btn .comm-icon.like, 
.hi-comment .group-btn .comm-icon.heart,
.hi-comment .group-btn .comm-icon.joy,
.hi-comment .group-btn .comm-icon.sad,
.hi-comment .group-btn .comm-icon.surprise {
    background: #eee;
    color: #666666;
    margin-left: 0;
}
.hi-comment .group-btn .comm-icon.check.my, 
.hi-comment .group-btn .comm-icon.ok.my,
.hi-comment .group-btn .comm-icon.no.my, 
.hi-comment .group-btn .comm-icon.like.my, 
.hi-comment .group-btn .comm-icon.heart.my,
.hi-comment .group-btn .comm-icon.joy.my,
.hi-comment .group-btn .comm-icon.sad.my,
.hi-comment .group-btn .comm-icon.surprise.my {
    background: #4778DE1A;
    border: 1px solid var(--primary);
    color: #666;
}
.hi-comment .group-btn .comm-icon:first-child {
    margin-left: 0;
}
.hi-comment .group-btn .comm-icon i {
    background-size: cover;
}
.hi-comment .group-btn .comm-icon.check i,
.hi-comment .group-btn .comm-icon.ok i,
.hi-comment .group-btn .comm-icon.no i,
.hi-comment .group-btn .comm-icon.like i,
.hi-comment .group-btn .comm-icon.joy i,
.hi-comment .group-btn .comm-icon.sad i,
.hi-comment .group-btn .comm-icon.surprise i {
    width: 16px;
    height: 16px;
}
.hi-comment .group-btn .comm-icon.heart i {
    width: 15px;
    height: 13.5px;
}
.hi-comment .group-btn span span.reaction-peoples {
    position: absolute;
    top: calc(100%);
    left: 50%;
    transform: translateX(-50%);
    width: 139px;
    height: 40px;
    visibility: hidden;
    display: block;
    z-index: 9999;
}
.hi-comment .group-btn span span.reaction-peoples span.empty {
    width: 139px;
    height: 4px;
    display: block;
}
.hi-comment .group-btn span span.reaction-peoples span.text {
    width: 139px;
    height: 36px;
    display: block;
    background: #000000E5;
    border-radius: 6px;
    text-align: center;
    color: #fff;
    font-size: 13px;
    font-weight: 400;
    line-height: 36px;
    margin: 0;
    padding: 0;
}
.hi-comment .group-btn span:hover span.reaction-peoples {
    visibility: visible;
}
.hi-comment .emoticon,
.hi-comment .photo,
.hi-comment .btn-file,
.hi-comment .video { margin-top: 8px; }
.hi-comment .emoticon img {
    width: 100px;
    height: 100px;    
}
/* 대댓글 아이콘 수정 end */
.hi-comment .photo {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
}
.hi-comment .photo span.img, 
.hi-comment .video span.thumb {
    display: inline-block;
    width: 90px;
    height: 90px;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #0000000D;
    background: #0000001A;
}

.hi-comment .photo span.img {
    background-color: #0000001A;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
}

.hi-comment .video span.thumb {
    background: #000;
}
.hi-comment .video span.thumb.encoded {
    background: none;
}
.hi-comment .photo span.img {
    margin: 0 8px 8px 0;
}
.hi-comment .photo span.img img, 
.hi-comment .video span.thumb img:not(.default) {
    width:100%;
    height:100%;
    object-fit:cover;
}
.hi-comment .video span.thumb {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}
.hi-comment .video span.thumb img.default {
    width: 32px;
    height: 32px;
    content: url("~@/assets/img/icon/icon_image_blank.png");
}
.hi-comment .video span.thumb button:not(.btn-delete-2) {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #00000085 url("~@/assets/img/icon_play_l.png") center/11.08px no-repeat;
}
.hi-comment .btn-file {
    position: relative;
    display: inline-block;
    width: auto;
    max-width: calc(100% - 25px);
}
.hi-comment .btn-file span.file {
    position: relative;
    display: inline-block;  
    max-width: 100%;
    background-color: #f3f4f8;
    border-radius: 35px;
    padding: 0 30px 0 35px;  
}
/* #68384 댓글 내 파일 첨부시 버튼과 텍스트 겹침 현상으로 우측 여백 확보 */
/* #68381 댓글 내 파일 첨부 길이  파일명에 맞게 수정 */
.hi-comment .btn-file span.file:not(:last-child) {
    margin-bottom: 8px;
}
.hi-comment .btn-file span.file::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 14px;
    display: inline-block;
    width: 20px;
    height: 20px;
    background: url("~@/assets/img/icon/icon_file_blue.svg") no-repeat;
    background-size: contain;
    transform: translateY(-50%);
    -webkit-transform: translateY(-50%);
}
.hi-comment .btn-file span.file span {
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    max-width: 100%;
    white-space: nowrap;
    color: var(--primary);
    font-size: 15px;
    line-height: 35px;
    font-weight: 400;
    vertical-align: middle;
}
.hi-comment .reply__list { margin-bottom: 24px; }
.hi-comment .reply__item {
    background-color: #f8fafe;
    position: relative;
    padding: 0 24px;
}
.hi-comment .reply__item:not(:first-of-type) .reply__content { border-top: 1px solid #e0e0e0; }
.hi-comment .reply__content {
    position: relative;
    padding: 24px;
    padding-left: 46px;
}
.hi-comment .comment__register {
    position: relative;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    align-items: flex-start;
    background-color: #f8f9fc;
    padding: 16px 16px 16px 16px;
    border-top: 1px solid #e0e0e0;
    border-radius: 0 0 10px 10px;
}
.hi-comment .comment__register .btn-attachment {
    position: relative;
    width: 40px;
    height: 40px;
    margin: 0 8px 0 0;
    border-radius: 26.67px;
    border: 1px solid #D6D6D6;
    background: url("~@/assets/img/icon/ic_plus.png") center no-repeat;
}
.hi-comment .comment__register .btn-attachment ul.file-select {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 0;
    width: 109px;
    background: #fff;
    z-index: 9999;
}
.hi-comment .comment__register .btn-attachment ul.file-select li {    
    box-shadow:1px 0 0 0 #D6D6D6, 0 1px 0 0 #D6D6D6, 1px 0 0 0 #D6D6D6 inset, 0 1px 0 0 #D6D6D6 inset, 1px 1px 0 0 #D6D6D6;
    width: 100%;
    height: 42px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 0 16px;
    font-size: 15px;
    font-weight: 500;
    color: #616161;
}
.hi-comment .comment__register .btn-attachment ul.file-select li i {
    margin-right: 4px;
}
.hi-comment .comment__register .btn-attachment ul.file-select li:first-child {
    border-top-left-radius: 2px;
    border-top-right-radius: 2px;
}
.hi-comment .comment__register .btn-attachment ul.file-select li:last-child {
    border-bottom-left-radius: 2px;
    border-bottom-right-radius: 2px;
}
.hi-comment .comment__register .btn-register {
    position: relative;
    width: 62px;
    height: 40px;
    color: #fff;
    font-size: 16px;
    font-weight: 500;
    line-height: 40px;
    background-color: var(--primary);
    border-radius: 40px;
    margin-left: 8px;
}
.hi-comment .comment__register .btn-register[disabled] { background-color: #d6d6d6; }
.hi-comment .comment__register .btn-attachment + .comment__editor { width: calc(100% - 118px); min-height: 40px; height: auto; }
.hi-comment .comment__editor {
    position: relative;
    width: 100%;
    background-color: #fff;
    padding: 8px 20px; 
    padding-left: 44px;
    padding-right: 72px;
    border: 1px solid #e0e0e0;
    border-radius: 20px;
}
.hi-comment .comment__editor.is-btn-attachment {
    width: calc(100% - 118px);
}
.hi-comment .comment__editor .group-btn {
    position: absolute;
    top: 0;
    right: 16px;
    font-size: 0;
}
.hi-comment .comment__editor .group-btn [class^="btn-"] {
    width: 20px;
    height: 20px;
    background: url("~@/assets/img/icon/icons_comment.png") 0 0/100px auto no-repeat;
}
.hi-comment .comment__editor .group-btn [class^="btn-"]:not(:first-of-type) { margin: 0 0 0 12px; }
.hi-comment .comment__editor .group-btn .btn-secret { background: url("~@/assets/img/icon/icon_btn_secret.png") center no-repeat; }
.hi-comment .comment__editor .group-btn .btn-secret.is-active { background: url("~@/assets/img/icon/icons_comment.png") 0 0/100px auto no-repeat; background-position: -20px 0; }
.hi-comment .comment__editor .group-btn .btn-emoticon {
    background: url("~@/assets/img/icon/icon_btn_emoticon.png") center no-repeat;
 }
.hi-comment .comment__editor .group-btn .btn-emoticon.is-active { background-position: -60px 0; }

.hi-comment .comment__editor .attachment {
    height: auto;
    max-height: 200px;
    overflow-y: auto;
}
.hi-comment .comment__editor .attachment .btn-file { padding: 0; width: 100%; }
.hi-comment .comment__editor .attachment .btn-file span { font-size: 14px;line-height: 34px; }
.hi-comment .comment__editor .attachment .btn-file .btn-delete {
    position: absolute;
    top: 8px;
    right: 10px; 
}
/* #68384 댓글 내 파일 첨부시 버튼과 텍스트 겹침 현상으로 우측 여백 확보 */
.hi-comment .comment__editor .attachment .emoticon { 
    position: relative;
    display: inline-block;
    border: 1px solid #E0E0E0;
    border-radius: 4px;
    width: 60px;
    height: 60px;
}
.hi-comment .comment__editor .attachment .emoticon img { 
    width: 100%;
    height: 100%;
    object-fit: cover;
 }
 .hi-comment .comment__editor .attachment .photo {
    width: 348px;
 }
.hi-comment .comment__editor .attachment .video span.thumb,
.hi-comment .comment__editor .attachment .photo span.img {  
    display: inline-block;
    width: 60px;
    height: 60px;
    border-radius: 4px;
    overflow: initial;
    border: 1px solid #0000000D;
    background: #0000001A;
    position: relative;
    margin: 0 9px 12px 0;
    cursor: pointer;
}
.hi-comment .comment__editor .attachment .photo span.img:hover:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 4px;
    background-color: #00000099;
    background-image: url("~@/assets/img/icon/icon_magicbar.svg");
    background-repeat: no-repeat;
    background-size: 20px 20px;
    background-position: center center;
}
.hi-comment .comment__editor .attachment .video span.thumb {
    background: #000;
}
.hi-comment .comment__editor .attachment .video span.thumb img.default {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
.hi-comment .comment__editor .attachment .photo span.img img { 
    width: 100%; 
    height:100%; 
    object-fit: cover; 
}
.hi-comment .comment__editor .attachment .emoticon .btn-delete {
    position: absolute;
    right: -4px;
    top: -4px;
}
.hi-comment .comment__editor .attachment .photo span.img .btn-delete-2,
.hi-comment .comment__editor .attachment .video span.thumb .btn-delete-2,
.hi-comment .comment__editor .attachment .emoticon .btn-delete-2 {
    position: absolute;
    top: -9px;
    right: -9px;
}

.hi-comment .comment__editor .attachment .attaching-img {
    position:relative;
    width:60px;
    height:60px;
    border:1px solid rgba(67, 81, 4, 0.1);
}
.hi-comment .comment__editor .attachment .attaching-img .img-wrap-loading {
    position: relative;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    height: calc(100% - 16px);
}
.hi-comment .comment__editor .attachment .attaching-img .img-wrap-loading .icon {
    width: 30px;
    height: 30px;
    background: url('~@/assets/img/icon_loading_infinite_30.png');
    background-position: -240px 0;
    animation: infinite_scroll_loading steps(8) 1s infinite;
}
.hi-comment .comment__editor .attachment .attaching-img .img-loading-txt {
    position: absolute;
    bottom: 0;
    width: 100%;
    background: #7a9ee9;
    text-align: center;
}
.hi-comment .comment__editor .attachment .attaching-img .img-loading-txt p {
    height: 16px;
    color: #fff !important;
    font-size: 12px;
    line-height: 16px;
    margin: 0 auto;
}

.hi-comment .comment__editor .image {
    overflow: hidden;
    position: absolute;
    left: 8px;
    top: 6px;
    width: 28px;
    padding-top: 28px;
    border-radius: 50%;
}
.hi-comment .comment__editor .image img {
    position: absolute;
    top: 50%;
    left: 50%;
    width: auto;
    min-width: 100%;
    height: 100%;
    background-color: #fff;
    transform: translate(-50%,-50%);
    -webkit-transform: translate(-50%,-50%);
    object-fit: cover;
    image-rendering: auto;
}
.hi-comment .comment__editor textarea {
    width: 100%;
    height: 24px;
    min-height: 24px;
    color: #222;
    font-size: 15px;
    line-height: 1.5;
    border: 0;
}
.hi-comment .comment__editor .reply {
    position: relative;
    display: inline-flex;
    align-items: center;
    background-color: #e1e9f9;
    color: #616161;
    font-size: 14px;
    line-height: 1.5;
    padding: 3px 8px;
    border-radius: 30px;
}
.hi-comment .comment__editor .reply span {
    color: #222;
    font-weight: 700;
}
.hi-comment .comment__editor .btn-delete {
    display: inline-block;
    width: 18px;
    height: 18px;
    background: url("~@/assets/img/icon/ic_seach_keyword_delete.png") center no-repeat;
    margin-left: 3px;
}
.hi-comment .comment__editor .btn-delete-2 {
    display: inline-block;
    width: 18px;
    height: 18px;
    background: url("~@/assets/img/icon/ic_seach_keyword_delete.png") center no-repeat;
}
.hi-comment .comment__editor .reply ~ textarea { margin-top: 4px; }
.hi-comment .comment__edit  { 
    padding-left: 46px;
    margin: 24px 0;
}
.hi-comment .reply__edit {
    padding: 24px 0;
    padding-left: 46px;
}
.hi-comment .comment__edit .comment__info .name,
.hi-comment .reply__edit .comment__info .name { margin-bottom: 4px; }
.hi-comment .comment__edit .comment__editor,
.hi-comment .reply__edit .comment__editor { padding: 8px 16px 50px; }
.hi-comment .comment__edit .comment__editor .group-btn,
.hi-comment .reply__edit .comment__editor .group-btn  { 
    top: inherit;
    right: inherit;
    bottom: 8px;
    left: 16px;
}
.hi-comment .comment__editor .group-btn-add {
    position: absolute;
    right: 16px;
    bottom: 8px;
}
.hi-comment .comment__edit .comment__editor .group-btn .btn-secret,
.hi-comment .reply__edit .comment__editor .group-btn .btn-secret {
    width: 20px;
    height: 20px;
    background: url("~@/assets/img/icon/icon_btn_secret.png") center no-repeat;
}
.hi-comment .comment__edit .comment__editor .group-btn .btn-secret:hover,
.hi-comment .reply__edit .comment__editor .group-btn .btn-secret:hover,
.hi-comment .comment__edit .comment__editor .group-btn .btn-secret.is-active,
.hi-comment .reply__edit .comment__editor .group-btn .btn-secret.is-active {
    width: 20px;
    height: 20px;
    background: url("~@/assets/img/icon/icons_comment.png") -20px 0px/100px auto no-repeat;
}
.hi-comment .comment__edit .comment__editor .group-btn .btn-emoticon,
.hi-comment .reply__edit .comment__editor .group-btn .btn-emoticon {
    width: 20px;
    height: 20px;
    background: url("~@/assets/img/icon/icon_btn_emoticon.png") center no-repeat;
}
.hi-comment .comment__editor .group-btn .btn-emoticon.is-active,
.hi-comment .comment__editor .group-btn .btn-emoticon:hover {
    width: 20px;
    height: 20px;
    background: url("~@/assets/img/icon/icons_comment.png") 0 0/100px auto no-repeat;
    background-position: -60px 0; 
}
.hi-comment .comment__edit .comment__editor .group-btn .btn-attachment,
.hi-comment .reply__edit .comment__editor .group-btn .btn-attachment {
    width: 20px;
    height: 20px;
    background: url("~@/assets/img/icon/icon_btn_attachment.png") center no-repeat;
    position: relative;
    margin-left: 12px;
}
.hi-comment .comment__edit .comment__editor .group-btn .btn-attachment:hover,
.hi-comment .reply__edit .comment__editor .group-btn .btn-attachment:hover {
    width: 20px;
    height: 20px;
    background: url("~@/assets/img/icon/icon_btn_attachment_on.png") center no-repeat;
}
.hi-comment .comment__edit .comment__editor .group-btn .btn-attachment ul.file-select,
.hi-comment .reply__edit .comment__editor .group-btn .btn-attachment ul.file-select {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    width: 109px;
    background: #fff;
    z-index: 9999;
}
.hi-comment .comment__edit .comment__editor .group-btn .btn-attachment ul.file-select li,
.hi-comment .reply__edit .comment__editor .group-btn .btn-attachment ul.file-select li {
    box-shadow:1px 0 0 0 #D6D6D6, 0 1px 0 0 #D6D6D6, 1px 0 0 0 #D6D6D6 inset, 0 1px 0 0 #D6D6D6 inset, 1px 1px 0 0 #D6D6D6;
    width: 100%;
    height: 42px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 0 16px;
    font-size: 15px;
    font-weight: 500;
    color: #616161;
}
.hi-comment .comment__edit .comment__editor .group-btn .btn-attachment ul.file-select li i,
.hi-comment .reply__edit .comment__editor .group-btn .btn-attachment ul.file-select li i {
    margin-right: 4px;
}
.hi-comment .comment__edit .comment__editor .group-btn .btn-attachment ul.file-select li:first-child,
.hi-comment .reply__edit .comment__editor .group-btn .btn-attachment ul.file-select li:first-child {
    border-top-left-radius: 2px;
    border-top-right-radius: 2px;
}
.hi-comment .comment__edit .comment__editor .group-btn .btn-attachment ul.file-select li:last-child,
.hi-comment .reply__edit .comment__editor .group-btn .btn-attachment ul.file-select li:last-child {
    border-bottom-left-radius: 2px;
    border-bottom-right-radius: 2px;
}
.hi-comment .comment__editor .group-btn-add button { margin-left: 4px; }
.hi-comment .emoticon-select-popup .emoticon-on-icon { display: none; }
.hi-comment .comment__list .emoticon-select-popup { 
    right: -400px;
    top: 30px;
    bottom: auto;
} 

</style>