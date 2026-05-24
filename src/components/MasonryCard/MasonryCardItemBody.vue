<template>
  <div class="grid-box-cont-wrap">
    <div class="grid-box-cont-inner">
      <!-- postTitle -->
      <div
        v-if="
          !$comn.isEmpty(title) &&
            (needTitleType(item) || isShowEvent())
        "
        class="text-wrap"
        :class="{
          title: !isNoPostContent
        }"
      >
        <template
          v-if="
            (item.postType === 'ALARM' && isNoPostContent) ||
              (item.postType === 'NOTICE' && isNoPostContent) ||
              (item.postType !== 'EDUCATION' &&
                item.postType !== 'EVENT' &&
                item.postType !== 'HINOTICE' &&
                item.postType !== 'ALARM' &&
                item.postType !== 'NOTICE')
          "
        >
          <p v-html="title"></p>
          <br />
        </template>
      </div>
      <!-- // postTitle -->

      <!-- postContent -->
        <!-- 알림장, 앨범, 자유게시판, 과제, 급식 -->
        <!-- 가정통신문, 학교공지 -->
        <template v-if="!isNoPostContent">
          <template v-if="(needContentType(item)) ||
            (item.postType === 'ALARM' || item.postType === 'NOTICE' || (!isExistThumbnail && item.postType === 'HINOTICE'))"
          >
            <div class="text-wrap">
              <p :inner-html.prop="item.listPostContent | cutByte(174)"></p>
            </div>
            <div v-if="isMoreBtn" class="more-wrap">더보기</div>
          </template>
        </template>
      <!-- // postContent -->

      <!-- 가정통신문 플러스 본문(없을 시 제목) 출력 -->
      <template
        v-if="
          !isExistThumbnail &&
            item.postType === 'ALARM_PLUS' &&
            item.alarmPlus !== null
        "
      >
        <div class="text-wrap">
          <p
            v-if="item.alarmPlus.contents !== ''"
            :inner-html.prop="item.alarmPlus.contents | cutByte(174)"
          ></p>

          <p v-else v-html="item.alarmPlus.title"></p>
        </div>
        <div v-if="isMoreBtnByAlarmPlus" class="more-wrap">
          더보기
        </div>
      </template>
      <!-- // 가정통신문 플러스 본문(없을 시 제목) 출력 -->

      <div
        class="img-wrap cropBox"
        v-if="isExistThumbnail && needThumbnailType(item)"
        :style="
          $imgUtil.setCropBoxImgStyle(
            imgCropCardForm.width,
            imgCropCardForm.height
          )
        "
      >
        <div
          v-if="item.postType === 'EVENT' && item.displayStatus === 'CLOSED'"
          class="event-end"
        >
          종료된 이벤트입니다.
        </div>

        <imgCrop
          :src="item.thumbnailPath"
          :width="imgCropCardForm.width"
          :height="imgCropCardForm.height"
          :key="item.thumbnailPath"
          :item="item"
        ></imgCrop>
      </div>
    </div>
  </div>
</template>
<script>
import { getByteLen } from '@/plugins/utils'
import imgCrop from '@/apps/main/MainBodyItemImageCropper.vue'
import { mapGetters, mapMutations, mapState } from "vuex";

export default {
  name: 'masonry-card-item-body',
  props: {
    item: Object,
    list: Array,
    pagePerSize: String,
    parentUriList: Array,
    pateType: String
  },
  data: () => ({
    isShow: false,
    getInfoTitleList: [],
    mainCategoryInfo: {},
    writtenEditorBoardList: ['NOTE', 'EVENT', 'EDUCATION', 'HINOTICE', 'BOARD', 'HOMEWORK'],
    imgPath: '',
    isClickPost: false,
  }),
  components: {
    imgCrop
  },
  created() {},
  mounted() {},
  computed: {
    ...mapState({
      clazzSubscribeViews: 'clazzSubscribeViews',
      imgCropCardForm: 'imgCropCardForm',
      maxLength: 'maxLength',
      user: 'user',
      userUri: 'userUri',
    }),
    ...mapGetters({
      getPostTypeNameByCode: "getPostTypeNameByCode",
    }),
    mainCategory() {
      const mainCategory = {
        ALBUM: '앨범',
        BOARD: '자유게시판',
        HOMEWORK: '과제',
        ALARM: '가정통신문',
        MEAL: '급식',
        NOTICE: '학교공지'
      }
      if (this.item.parent != null && this.item.parent.schoolType != null) {
        mainCategory.NOTE =
          this.getPostTypeNameByCode({
            code: 'NOTE',
            type: this.item.parent.schoolType
          })
      }
      return mainCategory
    },
    postTypeName() {
      return this.mainCategory[this.item.postType]
    },
    isReadPost() {
      return this.item.isRead
    },
    isLocatedEducation() {
      return !!this.$route.path.includes('/main/education')
    },
    isMoreBtn() {
      return (
        getByteLen(this.item.listPostContent) >
        this.maxLength.card.postContent
      )
    },
    isMoreBtnByAlarmPlus() {
      if (this.item.alarmPlus === null) return false
      else
        return (
          getByteLen(this.item.alarmPlus.contents) >
          this.maxLength.card.postContent
        )
    },
    isAlarm() {
      return this.item.postType === 'ALARM' ||
          this.item.postType === 'ALARM_PLUS'
    },
    isNote() {
      return this.item.postType === 'NOTE'
    },
    isMeal() {
      return this.item.postType === 'MEAL'
    },
    isExistThumbnail() {
      return this.item.thumbnailPath !== null && this.item.thumbnailPath !== undefined && this.item.thumbnailPath !== ''
    },
    isCrawlingPost() {
      return this.item.postType === 'ALARM' || this.item.postType === 'MEAL' || this.item.postType === 'NOTICE'
    },
    isNoPostContent() {
      const postContent = this.item.postContent

      if (postContent === null || postContent === undefined || postContent === '' || postContent.trim() === '')
        return true
      else if (this.isCrawlingPost)
        return this.removeAllTag(postContent).trim().length < 10
      else
        return false
    },
    title() {
      let title = this.item.postTitle || ''
      let posted = null

      if (this.isNote && !title) {
        posted = this.item.posted
      } else if (this.isMeal) {
        posted = this.item.postTitle
      }

      if (this.$moment(posted).isValid())
        title = this.$moment(posted).format(`M월 D일 (ddd) ${this.postTypeName}`)

      return title
    },
  },
  methods: {
    ...mapMutations({
      setAlarmPlusDetail: 'setAlarmPlusDetail',
    }),
    isShowEvent() {
      const path = this.$comn.split(this.$route.path, '/')
      return !!path.includes('event');
    },
    isManagedPostByNote() {
      let flag = false
      // 클래스 관리자인 경우 and 알림장 읽음 확인 처리 X
      if (this.item.postType === 'NOTE') {
        const parentUri = this.item.parentUri
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
    checkPostReadUser() {
      if (this.item.postType === 'ALARM_PLUS') {
        // item 읽음 처리
        this.item.isRead = true
      } else if (!this.isReadPost && !this.isMyPost) {
        if (this.isManagedPostByNote()) return false

        // item 읽음 처리
        this.item.isRead = true
      }
    },
    chkRead() {
      let flag = false

      if (this.isLocatedEducation) {
        flag = true
        return flag
      }

      if (
        this.item.postType === 'EVENT' ||
        this.item.postType === 'EDUCATION' ||
        this.item.postType === 'HINOTICE' ||
        this.item.postType === 'MEAL' ||
        this.item.postType === 'NOTICE' ||
        this.isAlarm
      ) {
        if (this.item.isRead) flag = true
        else {
          flag = this.isClickPost;
        }
      } else {
        if (this.item.insertedUserId === this.user.currentId) {
          flag = true
        } else if (this.isManagedPostByNote()) {
          flag = true
        } else {
          if (this.item.isRead) flag = true
          else {
            flag = this.isClickPost;
          }
        }
      }
      return flag
    },
    searchPostReadUser() {
      const params = {
        _user: this.userUri,
        _post: `${process.env.VUE_APP_BASE_API_URI}/posts/${this.item.currentId}`
      }
      return this.$hiClass.postReadUsers.search(params).then(result => {
        this.$log.debug(
          this.$options.name + ' search searchPostReadUser() result : ',
          result
        )
        return result
      })
    },
    openDetailPop(post) {
      const alarmPlusDetail = {
        eLetterId: post.alarmPlusId,
        userId: this.user.currentId,
        post: post
      }
      this.setAlarmPlusDetail(alarmPlusDetail)
    },
    needTitleType(item) {
      let flag = false
      let arr = ['NOTE', 'BOARD', 'HOMEWORK', 'ALARM', 'MEAL', 'NOTICE', 'EDUCATION', 'HINOTICE']
      let isExistThumbnail = item.thumbnailPath !== null

      if (arr.indexOf(item.postType) > -1) {
        flag = true
      }
      if (item.postType === 'EVENT' && !isExistThumbnail) {
        flag = true
      }
      return flag
    },
    needContentType(item) {
      let flag = false
      let arr = ['NOTE', 'ALBUM', 'BOARD', 'HOMEWORK', 'MEAL', 'HINOTICE']
      let isExistThumbnail = item.thumbnailPath !== null

      if (arr.includes(item.postType)) {
        flag = true
        // 급식 이미지가 있는 경우 본문 출력 안 함
        // 클래스 게시글의 이미지가 있는 경우 본문 출력 안 함
        if (isExistThumbnail && (
          item.postType === 'MEAL' ||
          item.postType === 'NOTE' ||
          item.postType === 'ALBUM' ||
          item.postType === 'BOARD' ||
          item.postType === 'HOMEWORK'
        )) {
          flag = false
        }
      }
      if (item.postType === 'EVENT' && !isExistThumbnail) {
        flag = true
      }

      return flag
    },
    needThumbnailType(item) {
      let flag = false
      let arr = [
        'NOTE', 'ALBUM', 'BOARD', 'HOMEWORK',
        'MEAL', 'ALARM_PLUS',
        'EDUCATION', 'EVENT',
      ]

      if (arr.includes(item.postType)) flag = true

      return flag
    },
    removeAllTag(html) {
      return html.replace(/(<([^>]+)>)/gi, '')
    }
  }
}
</script>

<style lang="scss" scoped>
.text-wrap.title {
  font-weight: 1000 !important;
}
</style>
