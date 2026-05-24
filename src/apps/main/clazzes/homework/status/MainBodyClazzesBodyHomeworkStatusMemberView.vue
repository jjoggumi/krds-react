<template>
  <div
    v-if="postHomeworkUser.writeUser && postHomeworkUser.writeUser.userId"
    id="member-view-modal"
    class="modal slick-modal view-main-detail-modal"
    style="display: block;"
  >
    <!-- ofy 클래스 : 스크롤 영역 보이게 -->
    <!-- modal 레이어가 Items List에 포함되어 있어 기존 포맷과 다름.
         아래와 같이 @click.self="cancel()를 2개 선언해야 백그라운드 클릭 닫힘 -->
    <div
      class="modal-cont-wrap"
      @click.self="cancel"
    >
      <div class="modal-cont">
        <div class="modal-cont-inner">
          <div class="slide-wrap">
            <div
              class="slide"
              @click.self="cancel"
            >
              <div class="school-class-cont-item boundary-box">
                <div class="item-title-wrap">
                  <div class="title type-homework">
                    <span>과제 제출</span>
                  </div>
                  <div class="school-student">
                    <span v-if="postHomeworkUser.writeUser && postHomeworkUser.writeUser.className">
                      {{ postHomeworkUser.writeUser.className }}
                    </span>   
                    <span v-else>
                      <slot name="className"></slot>
                    </span>
                    
                    <span>
                      {{ writeUserStr }}
                    </span>
                  </div>
                  <div class="txt-homework-fin">
                    <span>{{ sendDateToStr }}</span> 제출완료
                  </div>
                  <!-- 임시저장 temp-save 추가 -->

                  <div
                    v-if="isShowMoreBtn"
                    class="dot-more-btn-wrap"
                    v-click-outside="unClick"
                  >
                    <button
                      class="more-btn"
                      :class="{ on: isClicked }"
                      @click.prevent="click()"
                    ></button>
                    <div
                      class="more-popup-wrap"
                      :class="{ on: isClicked }"
                    >
                      <button
                        class="edit-btn icon"
                        @click="updateWork"
                      >
                        <span>수정</span>
                      </button>
                    </div>
                  </div>

                </div>
                <div class="item-cont-wrap">
                  <!-- 내용 S -->
                  <div class="text-wrap">
                    <!-- <p v-html="workContentHtml"></p> -->
                    <p>
                      <pre
                        v-html="workContentHtml"
                        style="line-height:inherit"
                      ></pre>
                    </p>
                  </div>
                  <!-- 내용 E -->

                  <!-- 첨부 이미지 & 동영상 영역 S -->
                  <div class="img-vedio-view-wrap" v-if="postHomeworkUser.files.length > 0">
                    <div class="img-vedio-view-inner">
                      <!-- 이미지 영역 -->
                      <div class="img-view-wrap">
                        <template
                          v-if="$comn.isImage(postHomeworkUser.files, true).length === 1"
                        >
                          <div
                            @click="imageView(true, 0)"
                            class="cropBox"
                            :style="
                              $imgUtil.setCropBoxImgStyle(
                                classImgCrop1.width,
                                classImgCrop1.height
                              )
                            "
                          >
                            <a>
                              <imgCrop
                                :src="
                                  $comn.isImage(postHomeworkUser.files, true)[0]
                                    .fileOriginalPath
                                "
                                :width="classImgCrop1.width"
                                :height="classImgCrop1.height"
                                :key="
                                  $comn.isImage(postHomeworkUser.files, true)[0]
                                    .fileOriginalPath
                                "
                                :i="0"
                              ></imgCrop>
                            </a>
                          </div>
                        </template>
                        <template v-else>
                          <template
                            v-for="(file, i) in $comn.isImage(postHomeworkUser.files, true)"
                          >
                            <div
                              :key="file.currentId"
                              :class="{
                                'left-wrap': i === 0,
                                'right-wrap': i === 1
                              }"
                              @click="imageView(true, i)"
                            >
                              <template v-if="i < 2">
                                <div
                                  class="cropBox"
                                  :style="
                                    $imgUtil.setCropBoxImgStyle(
                                      classImgCrop2.width,
                                      classImgCrop2.height
                                    )
                                  "
                                >
                                  <a>
                                    <imgCrop
                                      :src="file.fileOriginalPath"
                                      :width="classImgCrop2.width"
                                      :height="classImgCrop2.height"
                                      :key="file.fileOriginalPath"
                                      :i="i"
                                    ></imgCrop>
                                  </a>
                                </div>
                                <div
                                  class="cover-more"
                                  v-if="
                                    $comn.isImage(postHomeworkUser.files, true).length >
                                      2 && i === 1
                                  "
                                >
                                  <div class="more-text">
                                    <span>더보기</span>
                                  </div>
                                </div>
                              </template>
                            </div>
                          </template>
                        </template>
                      </div>
                      <!-- // 이미지 영역 -->

                      <!-- 동영상 영역 -->
                      <template v-for="file in $comn.isImage(postHomeworkUser.files, 'v')">
                        <hc-video
                          :key="
                            `${file.fileOriginalPath}-${file.fileTranscodePath}`
                          "
                          :item="postHomeworkUser.post"
                          :file="file"
                          :width="classImgCrop1.width"
                          :options="
                            $hiClass.setVideoOptions(file, 'classImgCrop1')
                          "
                          :contentType="`postHomework`"
                        />
                      </template>
                      <!-- // 동영상 영역 -->
                    </div>
                  </div>
                  <!-- 첨부 이미지 & 동영상 영역 E -->

                  <!-- 일반 첨부파일 영역 S -->
                  <div class="text-wrap">
                    <template v-for="file in $comn.isImage(postHomeworkUser.files, false)">
                      <button
                        :key="file.currentId"
                        class="attached-file btn-bg-cg"
                        @click="openDocView(file)"
                      >
                        {{ file.fileName }}
                      </button>
                    </template>
                  </div>
                  <!-- 일반 첨부파일 영역 E -->
                </div>

                <!-- 코멘트 컴포넌트 S-->
                <comment
                  v-if="isShowComment"
                  :post-item="postHomeworkUser.post"
                  :post-item-type="'POST_HOMEWORK_USERS'"
                  :post-homework-user="postHomeworkUser"
                  :is-show-comment="isShowComment"

                  :count.sync="commentListLeng"
                  :isManager="isManager"
                  :isReadOnly="false"
                  :isReplyUse="false"
                  :isReportUse="false"
                  :isUseFileUpload="false"
                  :contentType="`postHomework`"
                />
                <!-- 코멘트 컴포넌트 E-->
              </div>
            </div>
          </div>
          <div class="modal-close-btn modal-close-icon" @click="cancel()"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import imgCrop from '@/apps/main/MainBodyItemImageCropper.vue'
import hcVideo from '@/components/Form/HcVideo.vue'
import Comment from '@/components/Card/footer/comment/Comment.vue'

import { eventBus } from '@/main'
import {mapState, mapGetters, mapMutations } from "vuex";

export default {
  name: 'main-body-clazzes-body-homework-status-member-view',
  components: {
    imgCrop,
    hcVideo,
    Comment
  },
  props: {
    isManager: {
      type: Boolean,
      required: true
    },
    workId: {
      type: String,
      required: true
    },
    board: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      data: null,
      isClicked: false,
      isImgView: false,
      imgIndex: 0,
      commentListLeng: 0,
      postHomeworkUser: {}
    }
  },
  computed: {
    ...mapState({
      curUser: 'user',
      docView: 'docView',
      classImgCrop1: 'classImgCrop1',
      classImgCrop2: 'classImgCrop2',
    }),
    ...mapGetters({
      isAvailableClazzHomeworkSubmit: 'isAvailableClazzHomeworkSubmit',
      getUserTypeNameByCode: "getUserTypeNameByCode",
    }),
    workContentHtml() {
      return this.isMore
        ? this.postHomeworkUser.workContent
            .split('\n')
            .slice(0, 5)
            .join('\n')
        : this.postHomeworkUser.workContent
    },
    sendDateToStr() {
      if (this.postHomeworkUser.updatedTimestamp) {
        // 'M월 D일 (ddd) H시 m분' : 24시간으로 표시
        return this.$moment(this.postHomeworkUser.updatedTimestamp).format(
          'M월 D일 H시 m분'
        )
      } else return ''
    },
    /**
     * 클래스의 댓글 권한 참조
     */
    isShowComment() {
      return true
      // return (
        // this.item.postCommentUsed &&
        // this.clazzesHomeworkCommentUsed &&
        // (this.isManager ||
        //   this.isHomeworkCommentParents ||
        //   this.isHomeworkCommentStudent)
      // )
    },
    isShowMoreBtn() {
      return this.postHomeworkUser.writeUser.userId === this.curUser.currentId
    },
    isWriteUser() {
      return !!(this.postHomeworkUser.writeUser && this.postHomeworkUser.writeUser.userType)
    },
    writeUserStr() {
      if (this.isWriteUser) {
        let user = this.postHomeworkUser.writeUser.userName + ' '
        const memberRole = this.postHomeworkUser.writeUser.memberRole
        const userTypeName = this.getUserTypeNameByCode({code: this.postHomeworkUser.writeUser.userType})
        const memberChildName = this.postHomeworkUser.writeUser.memberChildName || '탈퇴회원'

        if (memberRole === 'OWNER' || memberRole === 'MANAGER')
          user += userTypeName
        else
          user += `(${memberChildName} ${userTypeName})`

        return ' / ' + user
      } else {
        // 클래스 게시글의 경우 writeUser 가 없다면 탈퇴회원 취급
        return ' / ' + '탈퇴회원'
      }
    },
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')

    this.getHomeworkUser()
  },
  destroyed() {
    const modals = document.getElementsByClassName('modal')

    if (modals.length > 0) {
      this.$hiClass.toggleBodyClass('add', 'hidden')
      setTimeout(() => {
        eventBus.$emit('detail-post-item-body-on-vco')
      }, 100)
    } else this.$hiClass.toggleBodyClass('remove', 'hidden')
  },
  methods: {
    ...mapMutations({
      setImageView: 'setImageView',
    }),
    click() {
      this.isClicked = true
    },
    unClick() {
      this.isClicked = false
    },
    isShowHandle() {
      this.cancel()
      this.$emit('handleModify', true, 'update') // 수정 컴포넌트 호출
    },
    cancel() {
      // document.body.classList.remove('hidden') // 이중 레이어 스크롤 버그 해결
      this.$emit('handleView', false)
    },
    async getHomeworkUser() {
      const url = `/postHomeworkUsers/${this.workId}`
      this.$hiClass.postHomeworkUsers
        .read(url)
        .then(res => {
          this.$log.debug(this.$options.name, 'getHomeworkUser() res => ', res)
          this.$set(this, 'postHomeworkUser', res.data)
        })
        .catch(err => {
          this.$log.debug(this.$options.name, 'getHomeworkUser() err => ', err)
        })
        .finally(() => {})
    },
    imageView(bool, i) {
      this.setImageView({
        isOpen: true,
        items: this.$comn.isImage(this.postHomeworkUser.files, true),
        index: i
      })
    },
    openDocView(file) {
      this.docView.item = file
      this.docView.isOpen = true
    },
    updateWork() {
      this.isAvailableClazzHomeworkSubmit({ board: this.board })
        ? this.isShowHandle(true)
        : this.$hiClass.alert('과제 제출 권한이 일치하지 않아 수정이 불가합니다.', 'warning')
    },
  }
}
</script>

<style lang="scss">
#member-view-modal.modal.slick-modal.view-main-detail-modal {
  z-index: 9000;
}
</style>
