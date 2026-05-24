<!--
@File(Method): CommentListParentItem.vue
@Author: -
@Date Created: -
@Description: 게시글 상세 댓글 (댓글 상세/수정)
@Modified: 2024-10-11 - #68852 영상변환 요청 결과 반영 개선
-->

<template>
  <div class="comment__item">
    <!-- edit -->
    <div
        v-if="isEditMode"
        class="comment__edit"
        style="display: block"
    >
      <div class="comment__info"> <!-- 2022-08-11 writer-info >> comment__info 로 변경 -->
        <!-- 댓글 프로필 사진 -->
        <comment-profile-thumbnail
            :isNotHiNotice="isNotHiNotice"
            :item-user-photo="item.userPhoto"
            :write-user-photo="item.writeUser.userPhoto"
        />
        <!-- :img-size="36" -->

        <span class="name">{{ getUserName(item) }}</span>

      </div>

      <div class="comment__editor">
        <div class="group-btn"> <!-- write-comment-btm-wrap -->
          <!-- 댓글 수정시에는 비밀여부 수정 불가 -->
          <comment-secret
              v-if="isVisibleSecret"
              :is-disabled="true"
              :isClassPost="isClassPost"
              :model="model"
          /> <!-- secret-btn dis-->
          <!-- 이모티콘 버튼 wrap -->
          <sticker-button
              v-if="isUseSticker && posWriteComment"
              ref="stickerButton"
              :files.sync="model.files"
              @setStickerItemUrl="setStickerItemUrl"
          />
          <!-- 댓글 첨부파일  -->
          <comment-file-upload
              v-if="isUseFileUpload && posWriteComment"
              :key="`comment-file-upload-${item.currentId}`"
              :emoticonPath.sync="model.emoticonPath"
              :files.sync="model.files"
              :is-add-files="isAddFiles"
              :is-add-sticker="isAddSticker"
              :is-update="'update'"
              :isNotHiNotice="isNotHiNotice"
              :unusedFiles="unusedFiles"
              @removeS="removeSticker"
              @stickerClosePopup="stickerClosePopup"
          /> <!-- btn-attach -->
        </div>

        <div class="group-btn-add"> <!-- .add-btn-wrap -->
          <button
              class="hi-btn btn-sm btn-line-lgray"
              @click="doCancel"
          >
            취소
          </button>
          <button
              :class="{ dis: !isSave }"
              :disabled="!isSave"
              class="hi-btn btn-sm"
              @click="doUpdate"
          >
            수정
          </button>
        </div>

        <comment-write-textarea
            :comment.sync="model.comment"
            :option="option"
            :pos-write-comment="posWriteComment"
        />

        <div class="attachment"> <!-- attach-file-wrap -->
          <!-- 1/2 업로드한 첨부파일 -->
          <comment-write-file-wrap
              :files.sync="model.files"
              :imageEditorKey="`comment-file-upload-${item.currentId}`"
              :unusedFiles="unusedFiles"
          />
          <!-- 2/2 선택한 스티커 -->
          <div
              v-if="isAddSticker"
              class="emoticon"
          >
            <img :src="model.emoticonPath" alt=""/>
            <button class="btn-delete" @click.stop="removeSticker"></button>
          </div>
        </div>

      </div>

      <div class="comment-info-wrap">
        <!-- 답글 목록 (child) -->
        <div
            v-if="item.childCommentCount > 0 && item.isChildComment"
            class="comment-reply"
        >
          <ul>
            <comment-list-child-item
                v-for="sub of item.childComment"
                :key="sub.currentId"
                :content-types="contentTypes"
                :is-manager="isManager"

                :is-parent-edit-mode="isEditMode"
                :is-read-only="isReadOnly"
                :is-report-use="isReportUse"
                :is-use-file-upload="isUseFileUpload"
                :is-use-sticker="isUseSticker"
                :isClassPost="isClassPost"

                :isClassPostForNameCheck="isClassPostForNameCheck"
                :isNotHiNotice="isNotHiNotice"
                :item="sub"
                :parent-item="item"
                :pos-write-comment="posWriteComment"
                :post-id="postId"
                :post-item-type="postItemType"
                :post-parent-id="postParentId"
                :post-write-user="postWriteUser"
            />
          </ul>
        </div>
      </div>

    </div>

    <!-- view -->
    <div v-else>

      <div class="comment__content"> <!-- comment-info-wrap -->

        <div class="comment__info"> <!-- 2022-08-11 writer-info >> comment__info 로 변경 -->
          <comment-profile-thumbnail
              :isNotHiNotice="isNotHiNotice"
              :item-user-photo="item.userPhoto"
              :write-user-photo="item.writeUser.userPhoto"
          />
          <span class="name">{{ getUserName(item) }}</span>
          <span v-if="isPostWriterComment" class="label me">작성자</span>
          <!-- prettier-ignore -->
          <span class="date">{{ commentTimeStr }}</span>
        </div>

        <comment-more
            v-if="!isReadOnly"
            :comment="item"
            :isClassPost="isClassPost"
            :isManager="isManager"
            :isReportUse="isReportUse"
            @is-delete="deleteComment"
            @is-report="reportComment"
            @is-update="updateComment"
        />
        <!-- #68211 비밀글 아이콘을 댓글과 첨부파일 좌측 영역에 나오도록 구조 변경을 위해 comment__con요소 추가 및 secret 클래스 위치 변경 -->
        <div :class="{ secret: item.secret }" class="comment__con">
          <comment-contents
              :comment="item.comment"
              :is-changed="item.updatedTimestamp && item.insertedTimestamp !== item.updatedTimestamp"
              :isClassPost="isClassPost"
              :secretDeny="item.secretDeny"
          />
          <div class="attachment"> <!-- .etc-wrap -->
            <comment-attach-file-wrap
                :files="item.files"
                :postType="postType"
                :userId="item.writeUser.userId"
            />
            <sticker-wrap
                v-if="!isEmpty(item.emoticonPath)"
                :src="item.emoticonPath"
            />
          </div>
        </div>

        <div
            v-if="!isPostHomeworkUserComment"
            class="group-btn"
        > <!-- .date-reply-wrap -->
          <button v-if="item.childCommentCount > 0"
                  :class="{
              'open': isShowReply === true
            }"
                  class="btn-reply view"
                  @click="getReply(item.currentId)"
          >
            답글보기 {{ item.childCommentCount }}개<i class="arrow"></i>
          </button>
          <template v-if="!isReadOnly && isReplyUse && item.writeUser.userStatus !== 'DEACTIVATE'">
            <button v-if="!(item.secretDeny || !posWriteComment)"
                    class="btn-reply write mr-0"
                    @click="setReplyMode(item, true)"
            >
              <i class="comment-write"></i>{{ $t('main.text.reply.add2') }}
            </button>
          </template>

          <template v-if="item.reactions && item.reactions.length">
            <template v-for="(reaction, index) of item.reactions">
              <span :key="`${reaction.iconId}-${index}`"
                    :class="[
                      'reaction-icon comm-icon',
                      {
                        'check': reaction.iconId === reactionIds[0],
                        'ok': reaction.iconId === reactionIds[1],
                        'no': reaction.iconId === reactionIds[2],
                        'like': reaction.iconId === reactionIds[3],
                        'heart': reaction.iconId === reactionIds[4],
                        'joy': reaction.iconId === reactionIds[5],
                        'sad': reaction.iconId === reactionIds[6],
                        'surprise': reaction.iconId === reactionIds[7],
                        'my': reaction.isReaction === true,
                      }
                    ]"
                    @click="selectReaction(reaction.iconId, reaction.isReaction, $event)"
                    @mouseover="reactionPeoplesOver">
                <span class="reaction-peoples" @click="reactionPeopleList($event)">
                  <span class="empty"></span>
                  <span class="text">반응한 사람 목록 보기</span>
                </span>
                <i :class="{
                  'reaction-check': reaction.iconId === reactionIds[0], 
                  'reaction-ok': reaction.iconId === reactionIds[1],
                  'reaction-no': reaction.iconId === reactionIds[2],
                  'reaction-like': reaction.iconId === reactionIds[3],
                  'reaction-heart': reaction.iconId === reactionIds[4],
                  'reaction-joy': reaction.iconId === reactionIds[5],
                  'reaction-sad': reaction.iconId === reactionIds[6],
                  'reaction-surprise': reaction.iconId === reactionIds[7],
                }"></i>{{ reaction.count }}
              </span>
            </template>
          </template>

          <button v-if="item.secretDeny === false"
                  :class="{
              show: isReactionList
            }"
                  class="btn-reply reaction"
                  @click="reactionList"
          >
            <i class="reaction"></i>
            <div v-if="isReactionList === true"
                 v-click-outside="reactionList"
                 class="reaction-select"
            >
                <span :class="{'my':isMyReaction.check }" class="check"
                      @click="selectReaction(reactionIds[0], isMyReaction.check, $event)">
                  <!-- <img class="reaction-check2" /> -->
                  <lottie :options="reactionAnimationDataCheck"/>
                </span>
              <span :class="{'my':isMyReaction.ok }" class="ok"
                    @click="selectReaction(reactionIds[1], isMyReaction.ok, $event)">
                  <lottie :options="reactionAnimationDataOk"/>
                </span>
              <span :class="{'my':isMyReaction.no }" class="no"
                    @click="selectReaction(reactionIds[2], isMyReaction.no, $event)">
                  <lottie :options="reactionAnimationDataNo"/>
                </span>
              <span :class="{'my':isMyReaction.like }" class="like"
                    @click="selectReaction(reactionIds[3], isMyReaction.like, $event)">
                  <lottie :options="reactionAnimationDataLike"/>
                </span>
              <span :class="{'my':isMyReaction.heart }" class="heart"
                    @click="selectReaction(reactionIds[4], isMyReaction.heart, $event)">
                  <lottie :options="reactionAnimationDataHeart"/>
                </span>
              <span :class="{'my':isMyReaction.joy }" class="joy"
                    @click="selectReaction(reactionIds[5], isMyReaction.joy, $event)">
                  <lottie :options="reactionAnimationDataJoy"/>
                </span>
              <span :class="{'my':isMyReaction.sad }" class="sad"
                  @click="selectReaction(reactionIds[6], isMyReaction.sad, $event)">
                <lottie :options="reactionAnimationDataSad"/>
              </span>
              <span :class="{'my':isMyReaction.surprise }" class="surprise"
                    @click="selectReaction(reactionIds[7], isMyReaction.surprise, $event)">
                  <lottie :options="reactionAnimationDataSurprise"/>
                </span>
            </div>
          </button>
          <!-- <template v-if="!isReadOnly && isReplyUse && item.writeUser.userStatus !== 'DEACTIVATE'">
            <button
              v-if="!(item.secretDeny || !posWriteComment)"
              class="btn-reply"
              @click="setReplyMode(item, true)"
            >
              {{ $t('main.text.reply.add')}}
            </button>
          </template>
          <button
            v-if="item.childCommentCount > 0 && item.isChildComment === false"
            class="btn-reply"
            @click="getReply(item.currentId)"
          >
            {{ `답글보기 (${item.childCommentCount}개)` }}
          </button> -->
        </div>


        <!--
        <div class="comment-title">
          <span
            v-if="isReplyUse && item.user.userStatus !== 'DEACTIVATE'"
            class="name"
            @click="setReplyMode(item, true)"
          >
            {{ getUserName(item) }}
          </span>
        </div>
        -->

      </div>

      <!-- 답글 목록 (child) -->
      <div
          v-if="item.childCommentCount > 0 && isShowReply === true"
          class="reply__list"
      >
        <comment-list-child-item
            v-for="sub of item.childComment"
            :key="sub.currentId"
            :content-types="contentTypes"
            :is-manager="isManager"

            :is-parent-edit-mode="isEditMode"
            :is-read-only="isReadOnly"
            :is-report-use="isReportUse"
            :is-use-file-upload="isUseFileUpload"
            :is-use-sticker="isUseSticker"
            :isClassPost="isClassPost"

            :isClassPostForNameCheck="isClassPostForNameCheck"
            :isNotHiNotice="isNotHiNotice"
            :item="sub"
            :parent-item="item"
            :pos-write-comment="posWriteComment"
            :post-id="postId"
            :post-item-type="postItemType"
            :post-parent-id="postParentId"
            :post-write-user="postWriteUser"
        />
      </div>
    </div>

    <comment-reaction-list
        v-if="isReactionPeopleList"
        :comment-id="item.currentId"
        :isClassPostForNameCheck="isClassPostForNameCheck"
        @close="reactionPeopleListClose"
    />
  </div>
</template>

<script>
import CommentProfileThumbnail from "@/components/Card/footer/comment/CommentProfileThumbnail";
import CommentContents from "@/components/Card/footer/comment/CommentContents";
import CommentMore from "@/components/Card/footer/comment/CommentMore";
import CommentAttachFileWrap from "@/components/Card/footer/comment/CommentAttachFileWrap";
import CommentFileUpload from "@/components/Card/footer/comment/CommentFileUpload";
import CommentWriteFileWrap from "@/components/Card/footer/comment/CommentWriteFileWrap";
import CommentWriteTextarea from "@/components/Card/footer/comment/CommentWriteTextarea";
import CommentSecret from "@/components/Card/footer/comment/CommentSecret";
import CommentListChildItem from "@/components/Card/footer/comment/CommentListChildItem";
import CommentReactionList from "@/components/Card/footer/comment/CommentReactionList";
import Lottie from "@/components/Lottie/Lottie";

import ErrorLoadFailAsyncComponent from "@/apps/error/ErrorLoadFailAsyncComponent";
import {mapFields} from "vuex-map-fields";
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import {eventBus} from "@/main";
import {cloneDeep} from "lodash";
import hash from 'object-hash';

import reactionAnimationDataCheck from '@/assets/img/icon/check.json';
import reactionAnimationDataOk from '@/assets/img/icon/ok.json';
import reactionAnimationDataNo from '@/assets/img/icon/no.json';
import reactionAnimationDataLike from '@/assets/img/icon/like.json';
import reactionAnimationDataHeart from '@/assets/img/icon/heart.json';
import reactionAnimationDataJoy from "@/assets/img/icon/joy.json";
import reactionAnimationDataSad from "@/assets/img/icon/sad.json";
import reactionAnimationDataSurprise from "@/assets/img/icon/surprise.json";

const StickerWrap = () => ({
  component: import('@/components/Sticker/StickerWrap'),
  error: ErrorLoadFailAsyncComponent,
})
const StickerButton = () => ({
  component: import('@/components/Sticker/StickerButton'),
  error: ErrorLoadFailAsyncComponent,
})

export default {
  name: "comment-list-parent-item",
  components: {
    CommentProfileThumbnail,
    CommentContents,
    CommentMore,
    CommentAttachFileWrap,
    CommentFileUpload,
    CommentWriteFileWrap,
    CommentWriteTextarea,
    CommentSecret,
    CommentListChildItem,
    StickerWrap,
    StickerButton,
    CommentReactionList,
    Lottie
  },
  props: {
    item: {
      type: Object,
      required: true
    },
    postId: {
      type: String,
      required: true
    },
    postWriteUser: {
      type: Object,
    },
    contentTypes: {
      type: Object,
      required: true
    },
    isNotHiNotice: {
      type: Boolean,
    },
    isClassPost: {
      type: Boolean,
    },
    isManager: {
      type: Boolean,
    },
    isReadOnly: {
      type: Boolean,
    },
    isReplyUse: {
      type: Boolean,
      default() {
        return true
      }
    },
    isReportUse: {
      type: Boolean,
    },
    isUseFileUpload: {
      type: Boolean,
    },
    isUseSticker: {
      type: Boolean,
    },
    posWriteComment: {
      type: Boolean,
    },
    postItemType: {
      type: String
    },
    childCommentCount: Number,
    postParentId: String,
    postType: String
  },
  data() {
    return {
      isEditMode: false,
      option: {
        isFirst: true,
        commentPlaceholder: '',
        replyUserName: ''
      },
      model: {},
      isShildItemShow: true,
      isShowReply: false,
      isReactionList: false,
      isMyReaction: {
        check: false,
        ok: false,
        no: false,
        like: false,
        heart: false,
        joy: false,
        sad: false,
        surprise: false,
      },
      isReactionPeopleList: false,
      reactionAnimationDataCheck: {animationData: reactionAnimationDataCheck.default || reactionAnimationDataCheck},
      reactionAnimationDataOk: {animationData: reactionAnimationDataOk.default || reactionAnimationDataOk},
      reactionAnimationDataNo: {animationData: reactionAnimationDataNo.default || reactionAnimationDataNo},
      reactionAnimationDataLike: {animationData: reactionAnimationDataLike.default || reactionAnimationDataLike},
      reactionAnimationDataHeart: {animationData: reactionAnimationDataHeart.default || reactionAnimationDataHeart},
      reactionAnimationDataJoy: {animationData: reactionAnimationDataJoy.default || reactionAnimationDataJoy},
      reactionAnimationDataSurprise: {animationData: reactionAnimationDataSurprise.default || reactionAnimationDataSurprise},
      reactionAnimationDataSad: {animationData: reactionAnimationDataSad.default || reactionAnimationDataSad},
      isWait: false,
      unusedFiles: []
    }
  },
  computed: {
    ...mapState({
      user: 'user',
      reactionIds: 'reactionIds'
    }),
    ...mapGetters({
      getUserTypeNameByCode: 'getUserTypeNameByCode',
      getReactionIconId: 'getReactionIconId'
    }),
    ...mapFields({
      isDimLoading: 'isDimLoading'
    }),
    isChanged() {
      const itemFilesHash = hash(this.item.files)
      const modelFilesHash = hash(this.model.files)
      const isChangedComment = this.item.comment !== this.model.comment
      const isChangedSticker = this.item.emoticonPath !== this.model.emoticonPath
      const isChangedFiles = itemFilesHash !== modelFilesHash

      this.$log.debug(`itemFilesHash, modelFilesHash`, itemFilesHash, modelFilesHash)

      return isChangedComment || isChangedSticker || isChangedFiles
    },
    isSave() {
      return !this.isFileProgress && this.isChanged && (
          this.isModelComment || this.isAddSticker || this.isAddFiles
      )
    },
    isModelComment() {
      return this.model.comment && this.model.comment.length > 0 && this.model.comment.trim() !== ''
    },
    isFileProgress() {
      // return this.model.files.length > 0 && this.model.files[0].progress
      return this.model.files.length > 0 && this.model.files.some(v => v.progress >= 0) === true
    },
    isAddFiles() {
      return this.model.files && this.model.files.length > 0
    },
    isAddSticker() {
      return this.model.emoticonPath && this.model.emoticonPath.length > 0 && this.model.emoticonPath.trim() !== ''
    },
    isPostWriterComment() {
      if (this.isPostHomeworkUserComment) return false

      return this.item.writeUser && this.item.writeUser.memberRole && (this.item.writeUser.userId === this.postWriteUser.userId)
    },
    isPostHomeworkUserComment() {
      return this.contentTypes.methodName === 'postHomeworkUserComments'
    },
    isVisibleSecret() {
      return this.isNotHiNotice && !this.isPostHomeworkUserComment && this.postType !== 'EVENT'
    },
    commentTimeStr() {
      const timestamp = this.item.insertedTimestamp
      return this.$moment(timestamp).format('M월 D일 H시 m분')
    },
    isClassPostForNameCheck() {
      return ['NOTE', 'ALBUM', 'BOARD', 'HOMEWORK'].includes(this.postType)
    },
    getIsShowReply() {
      return this.item.isShowReply
    }
  },
  watch: {
    getIsShowReply(v) {
      this.isShowReply = v
    }
  },
  methods: {
    ...mapMutations({
      setItemDetailObj: 'setItemDetailObj',
      setIsShowDetailPostLayer: 'setIsShowDetailPostLayer',
    }),
    ...mapActions({
      isAllDeviceLogout: 'isAllDeviceLogout'
    }),
    isEmpty(src) {
      return src === undefined || src === null || src.trim() === '';
    },
    getUserName(item) {
      if (this.isPostHomeworkUserComment === true || this.isClassPostForNameCheck === true) {
        let userName = this.isNotHiNotice ? this.getWriteUserName(item) : item.writeUser.userName
        if (item.writeUser.userStatus === 'DEACTIVATE')
          userName = this.$t('main.unknown.user.name')
        return userName
      } else if (this.isClassPostForNameCheck === false) {
        if (!item.writeUser.userName === true) return "(알수없음)"
        else return item.writeUser.userName
      }
    },
    getWriteUserName(item) {
      if (item.writeUser) {
        let user = item.writeUser.userName + ' '
        const memberRole = item.writeUser.memberRole
        const userTypeName = item.writeUser.userType ? ' ' + this.getUserTypeNameByCode({code: item.writeUser.userType}) : ''
        const memberChildName = item.writeUser.memberChildName || this.$t('main.unknown.user.name')

        switch (memberRole) {
          case 'MANAGER':
          case 'OWNER':
            user += userTypeName
            break

            // 클래스 탈퇴 등으로 구독 정보가 삭제된 경우
          case null:
            user = this.$t('main.unknown.user.name')
            break
          case undefined:
            user = this.$t('main.unknown.user.name')
            break

          default:
            user += `(${memberChildName}${userTypeName})`
        }
        return user

      } else {
        return ''
      }
    },
    updateComment() {
      this.$set(this, 'model', cloneDeep(this.item))
      this.isEditMode = true
    },
    removeSticker() {
      this.model.emoticonPath = null
    },
    setStickerItemUrl(url) {
      this.model.emoticonPath = url
    },
    doCancel() {
      this.isEditMode = false
      this.unusedFiles = []
    },
    // 댓글 수정
    async doUpdate() {
      this.isDimLoading = true
      const deviceRes = await this.isAllDeviceLogout(true)
      if (deviceRes) {
        this.isDimLoading = false
        return false;
      }
      // 댓글 수정 시 postOptions 무시

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

      if (this.model.files && this.model.files.length > 0) {
        this.model.files = this.model.files.filter(file => !file.fileOriginalPath === false)
      }

      try {
        const obj = {
          ...JSON.parse(JSON.stringify(this.model)),
          _links: {
            self: {
              href: `${this.$apiUrl}/${this.contentTypes.methodName}/${this.model.currentId}`
            }
          }
        }

        const res = await this.$hiClass[this.contentTypes.methodName].update(obj)
        if (res) {
          this.$log.debug(this.$options.name, 'doUpdate() res:', res)

          const isChangedComment = this.item.comment !== this.model.comment
          const isChangedSticker = this.item.emoticonPath !== this.model.emoticonPath

          for (const key of Object.keys(this.item))
            this.item[key] = this.model[key]

          if (isChangedComment || isChangedSticker)
            this.item.updatedTimestamp = this.$moment().valueOf()

          this.deleteUnusedFiles()
          this.isEditMode = false
        }
      } catch (err) {
        this.$log.debug(this.$options.name, ' setComment() error => ', err)
        if (err.response) {
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
                    this.setItemDetailObj({})
                    this.setIsShowDetailPostLayer(false)
                    this.$router.push('/', () => {
                    })
                  })
              break
            }
            case 428: {
              this.$hiClass.alert('삭제된 댓글은 수정이 불가합니다.', 'warning')
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
        this.isDimLoading = false
      }
    },
    deleteUnusedFiles() {
      let deleteApi = []
      this.unusedFiles.forEach(file => {
        deleteApi.push(this.$hiClass.multipart.delete(file))
      })
      Promise.allSettled(deleteApi)
          .then(() => {
            this.unusedFiles = []
          })
    },
    deleteComment(item) {
      eventBus.$emit(`${this.postItemType}-delete-comment-by-post-id|${this.postId}`, item)
    },
    reportComment(item) {
      eventBus.$emit(`${this.postItemType}-report-comment-by-post-id|${this.postId}`, item)
    },
    setReplyMode(item, bool) {
      eventBus.$emit(`${this.postItemType}-set-reply-mode-by-post-id|${this.postId}`, item, bool)
    },
    getReply(parentId) {
      if (this.postType === 'EVENT') this.isShildItemShow = false

      this.isShowReply = !this.isShowReply
      eventBus.$emit(`${this.postItemType}-get-reply-by-post-id|${this.postId}`, parentId)
    },
    initCommentList() {
      eventBus.$emit(`${this.postItemType}-init-comment-list-by-post-id|${this.postId}`)
    },
    reactionList() {
      this.reactionMyUpdate()
      this.isReactionList = !this.isReactionList
    },
    reactionMyInit() {
      this.isMyReaction.check = false
      this.isMyReaction.ok = false
      this.isMyReaction.no = false
      this.isMyReaction.like = false
      this.isMyReaction.heart = false
      this.isMyReaction.joy = false
      this.isMyReaction.sad = false
      this.isMyReaction.surprise = false
    },
    reactionMyUpdate() {
      this.reactionMyInit()
      if (!this.item.reactions === false) {
        for (let obj of this.item.reactions) {
          if (obj.isReaction === true) {
            if (obj.iconId === this.reactionIds[0]) this.isMyReaction.check = true
            else if (obj.iconId === this.reactionIds[1]) this.isMyReaction.ok = true
            else if (obj.iconId === this.reactionIds[2]) this.isMyReaction.no = true
            else if (obj.iconId === this.reactionIds[3]) this.isMyReaction.like = true
            else if (obj.iconId === this.reactionIds[4]) this.isMyReaction.heart = true
            else if (obj.iconId === this.reactionIds[5]) this.isMyReaction.joy = true
            else if (obj.iconId === this.reactionIds[6]) this.isMyReaction.sad = true
            else if (obj.iconId === this.reactionIds[7]) this.isMyReaction.surprise = true
          }
        }
      }
    },
    reactionPeopleList(e) {
      e.stopPropagation()
      this.isReactionPeopleList = !this.isReactionPeopleList
    },
    reactionPeopleListClose() {
      this.isReactionPeopleList = false
    },
    async selectReaction(id, isMyReaction, e) {
      if (this.isWait === false) {
        this.isWait = true
        const iconId = id
        const params = {
          iconId: iconId,
          commentId: this.item.currentId,
          postId: this.postId,
          userId: this.user.currentId,
          parentId: this.postParentId
        }

        if (isMyReaction === true) {
          try {
            const res = await this.$axios({
              method: 'DELETE',
              url: `/commentReactions/${this.item.currentId}/${iconId}?userId=${this.user.currentId}`,
            })
          } catch (err) {
            this.$log.debug('commentReactions DELETE() error => ', err)
          }
        } else {
          try {
            const res = await this.$axios({
              method: 'PUT',
              url: `/commentReactions`,
              data: params
            })
          } catch (err) {
            this.$log.debug('commentReactions PUT() error => ', err)
          }
        }

        try {
          const res = await this.$axios({
            method: 'GET',
            url: `/commentReactions/count/${this.item.currentId}`,
            params: {
              userId: this.user.currentId
            }
          })

          if (res.data._embedded) {
            this.item.reactions = res.data._embedded.commentReactionCounts
          } else {
            this.item.reactions = null
          }

          if (isMyReaction === true) { // 취소
            if (!this.item.reactions === false) {
              this.item.reactions = this.item.reactions.map(item => {
                if (item.iconId === iconId && item.isReaction === true) {
                  item.isReaction = false
                  item.count = item.count - 1
                  return item
                } else {
                  return item
                }
              })

              this.item.reactions = this.item.reactions.filter(v => v.count > 0)
            }
          } else {  // 추가 
            if (!this.item.reactions === true) {
              // this.item.reactions.push({
              //   count: 1,
              //   iconId: iconId,
              //   isReaction: true
              // })

              this.item.reactions = [{
                count: 1,
                iconId: iconId,
                isReaction: true
              }]
            } else {
              const index = this.item.reactions.findIndex(item => item.iconId === iconId)

              if (index > -1) {
                this.item.reactions = this.item.reactions.map(item => {
                  if (item.iconId === iconId && item.isReaction === false) {
                    item.isReaction = true
                    item.count = item.count + 1
                    return item
                  } else {
                    return item
                  }
                })
              } else {
                this.item.reactions.push({
                  count: 1,
                  iconId: iconId,
                  isReaction: true
                })
              }
            }
          }
          this.reactionMyUpdate()
        } catch (err) {
          this.$log.debug('commentReactions count GET() error => ', err)
        } finally {
          this.isWait = false
        }
      }
    },
    reactionPeoplesOver() {
      this.isReactionList = false
    },
    stickerClosePopup() {
      this.$refs.stickerButton.closePopup()
    }
  },
  created() {
    if (this.isPostHomeworkUserComment === false) {
      //this.postType = "Homework"
      //} else {
      //this.postType = this.item.post.postType

      if (this.postType === "EVENT" && this.isShildItemShow === false) {
        eventBus.$emit(`${this.postItemType}-get-reply-by-post-id|${this.postId}`, this.item.currentId)
      }
    }
  }
}
</script>

<style scoped>

</style>