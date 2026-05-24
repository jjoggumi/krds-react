<template>
  <div class="grid-box-title-wrap">
    <!-- 게시물 타입 (필독여부, 첨부파일 여부) -->
    <div
      class="title"
      :class="{
        'necessary-read': item.postMustRead,
        new: isNew()
      }"
    >
      <!-- 'exist-file': !item.postMustRead && item.fileCounts > 0,-->
      <template v-if="pateType === 'event'">
        <span v-if="item.postType !== 'EVENT'">{{ postTypeName }}</span>
        <span v-else>{{ item.postTitle }}</span>
      </template>
      <template v-else>
        <span>{{ postTypeName }}</span>
      </template>
    </div>
    <!-- // 게시물 타입 (필독여부, 첨부파일 여부) -->

    <!--
      클래스 게시물: 클래스명
      학교 게시물: 학교명
      추천정보, 이벤트: 게시물 제목
    -->
    <template v-if="pateType === 'event'">
      <p v-if="item.postType === 'EDUCATION'" v-html="item.postTitle"></p>
      <p
        v-else-if="item.postType !== 'EVENT'"
        v-html="
          item.parent !== null
            ? item.parent.parentName
            : getParentUriName(item.parentUri)
        "
      ></p>
    </template>
    <template v-else>
      <p
        v-if="item.postType === 'EDUCATION' || item.postType === 'EVENT' || item.postType === 'HINOTICE'"
        v-html="item.postTitle"
      ></p>
      <p
        v-else
        v-html="
          item.parent !== null
            ? item.parent.parentName
            : getParentUriName(item.parentUri)
        "
      ></p>
    </template>
    <!-- //
      클래스 게시물: 클래스명
      학교 게시물: 학교명
      추천정보, 이벤트: 게시물 제목
    -->
  </div>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  name: 'masonry-card-item-header',
  props: {
    item: Object,
    list: Array,
    pagePerSize: String,
    parentUriList: Array,
    pateType: String,
    isClickPost: Boolean
  },
  data() {
    return {}
  },
  components: {},
  computed: {
    ...mapGetters({
      getPostTypeNameByCode: "getPostTypeNameByCode",
    }),
    isLocatedMain() {
      return !!this.$route.path.includes('/main/home')
    },
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
      const ignorePostTypes = ['EDUCATION', 'EVENT']

      if (ignorePostTypes.includes(this.item.postType)) {
        return this.getMainCategory(this.item).mainCateNm

      } else {
        const params = {
          code: this.item.postType
        }
        if (params.code === 'NOTE' && this.item.parent != null && this.item.parent.schoolType != null)
          params.type = this.item.parent.schoolType

        if (this.item.alarmPlus != null && this.item.alarmPlus.letterType != null)
          params.type = this.item.alarmPlus.letterType

        return this.getPostTypeNameByCode(params)

      }
    }
  },
  created() {
    // this.$hiClass.replacePostVersion(this.item)
  },
  methods: {
    getMainCategory(item) {
      let retObj = {}

      try {
        if (this.$comn.split(this.$route.path, '/') !== 'home') {
          let categoryName = ''
          if (this.$comn.split(this.$route.path, '/') === 'info') {
            if (
              this.parentUriList.length > 0 &&
              item.postType === 'EDUCATION'
            ) {
              categoryName =
                this.item.parent !== null
                  ? this.item.parent.parentName
                  : this.getParentUriName(item.parentUri)
            }
          } else {
            if (item.isFinished || item.displayStatus === 'CLOSED')
              categoryName = '종료된 이벤트'
            else if (item.displayStatus === 'PROGRESSING')
              categoryName = '진행중인 이벤트'
            else if (item.displayStatus === 'EXPECTED')
              categoryName = '진행 예정 이벤트'
          }
          retObj.mainCateNm = categoryName
          retObj.isEdu = true
        }
        if (this.$comn.split(this.$route.path, '/') === 'home') {
          retObj.mainCateNm = this.mainCategory[this.getPostType(item)]
          retObj.isEdu = false
        } else retObj.isEdu = true

        if (retObj.mainCateNm === undefined) {
          let anotherMainCategory = { EVENT: '이벤트', EDUCATION: '추천정보', HINOTICE: '공지사항' }
          retObj.mainCateNm = anotherMainCategory[this.getPostType(item)]
        }
      } catch (error) {
        this.$log.warn(error)
      }

      return retObj
    },
    getParentUriName(parentUri) {
      if (
        this.parentUriList !== undefined &&
        this.parentUriList !== null &&
        this.parentUriList.length > 0
      ) {
        // this.$log.warn("parentUri => ", parentUri);
        const that = this
        const parentUuid = this.$comn.split(parentUri, '/')

        let getIdx = this.parentUriList
          .map(function(d) {
            return that.$comn.split(d['uri'], '/')
          })
          .indexOf(parentUuid)

        // this.$log.warn(
        //   "this.parentUriList[getIdx] => ",
        //   this.parentUriList[getIdx]
        // );
        if (
          this.parentUriList[getIdx] !== undefined &&
          this.parentUriList[getIdx] !== null
        )
          return this.parentUriList[getIdx].orgName
        else return ''
      } else return ''
    },
    isNew() {
      let curTimestamp = new Date().getTime()
      let isNew = false
      if (this.isLocatedMain) {
        isNew = false
        return isNew
      }

      if (this.item.postType === 'EVENT') {
        if (this.item.posted > curTimestamp - 86400000 * 3) isNew = true
      } else {
        if (this.item.posted > curTimestamp - 86400000) isNew = true
      }

      if (
        this.item.postType === 'EVENT' ||
        this.item.postType === 'EDUCATION' ||
        this.item.postType === 'HINOTICE'
      ) {
        if (this.item.isRead) isNew = false
        else {
          isNew = !this.isClickPost;
        }
      } else {
        if (this.item.insertedUserId === this.$store.state.user.currentId) {
          isNew = false
        } else {
          if (this.item.isRead) isNew = false
          else {
            isNew = !this.isClickPost;
          }
        }
      }

      return isNew
    },
    getPostType(item) {
      return item.postType === 'ALARM_PLUS' ? 'ALARM' : item.postType
    }
  }
}
</script>

<style scoped></style>
