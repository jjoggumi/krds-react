<!--
@File(Method):MainPostsSearchItem.vue
@Description: 메인 > 검색 > 결과 리스트 > 아이템
@Modified: 2025-03-06 - #72670 비밀게시판 명칭 변경 > 그룹게시판
-->
<template>
  <div
      class="search-result-content-item has-file"
      role="button"
      @click="openPostPopup"
  >
    <div class="post-info">
      <div
          class="profile-image"
          :style="{'background-image': writeUserPhoto}"
      />

      <div class="info">
        <div class="author">
          {{ writeUserName }}
          <span class="class-name" v-if="isClassPost">
            <div class="circle"></div>{{ post.parentName }}
          </span>
        </div>
        <div class="date">
          {{ $moment(post.posted).format(`M월 D일 ddd요일`) }}
          <span class="period" v-if="post.postType === 'HOMEWORK'">
            {{ post.timestampEnd ? `제출기한: ${$moment(post.timestampEnd).format(`M월 D일(ddd) HH시 mm분 까지`)}` : '제출기한: 마감일 없음' }}
          </span>
        </div>
      </div>

      <div class="file-comment-count">
        <span class="file" v-if="documentFiles.length > 0">{{ documentFiles.length }}</span>
        <span
            class="comment"
            v-if="isClassPost ? post.board.isUsedComment : post.postCommentUsed"
        >
          {{ post.commentCount }}
        </span>
      </div>
    </div>

    <div class="post-content-wrap">
      <div class="post-content" :class="{'has-thumbnail': thumbnailFiles.length > 0}">
        <div class="content">
          <div class="category">
            <span>
              <HiIcon name="ico-group-fill" color="gray" size="20" class="board-type-group" v-if="(post.board || {}).boardType === 'SECRET'" />
              {{ postType }}</span> 
            <!-- 
            <span :class="{'secret': (post.board || {}).boardType === 'SECRET'}" >{{ postType }}</span>  
            -->
            <span class="point" v-if="post.postMustRead">필독</span>
          </div>
          <div class="title" v-html="getPostTitle()"></div>
          <div class="text" v-html="getPostContent()"></div>
        </div>
        <div
            class="thumbnail"
            :class="{'is-video': thumbnailFiles[0].fileContentType.includes('video')}"
            v-if="thumbnailFiles.length > 0"
            :style="{'background-image': `url('${thumbnail}')`}"
        >
          <div class="thumbnail-count" v-if="thumbnailFiles.length > 1">{{ thumbnailFiles.length }}</div>
        </div>
      </div>

      <div class="file-list" v-if="includesKeywordFiles.length > 0">
        <div class="file"
             v-for="(file, idx) of includesKeywordFiles"
             :key="file.fileOriginalPath"
        >
          <span v-html="file.fileName"></span>
        </div>
      </div>
      
      <post-safe-content 
        v-if="!post.postOptions === false && post.postType === 'NOTE'"
        :postOptions="post.postOptions"
        :searchKeyword="searchKeyword">
      </post-safe-content>
    </div>

  </div>
</template>

<script>
import {mapActions, mapGetters, mapState} from "vuex";
import PostSafeContent from "@/components/Card/content/PostSafeContent"

export default {
  name: "mainPostsSearchItem",
  components: {
    PostSafeContent
  },
  data() {
    return {
      searchKeyword: ''
    }
  },
  props: {
    post: {
      type: Object
    }
  },
  created() {
    this.searchKeyword = this.$route.query.searchKeyword
    // 키워드 하이라이트. 포함되는 단어가 중복일때 긴것부터 replace하기 위함. ex) 알림, 알림장
    if (this.post.keywords && this.post.keywords.length > 0) {
      this.post.keywords.sort((a,b) =>  {return b.length - a.length})
    }
  },
  computed: {
    ...mapState({
      clazzSubscribeViews: 'clazzSubscribeViews'
    }),
    ...mapGetters({
      getPostTypeNameByCode: 'getPostTypeNameByCode'
    }),
    writeUserName() {
      if (this.isClassPost) {
        if (this.post.writeUser) {
          const userName = this.post.writeUser.userName
          switch (this.post.writeUser.userType) {
            case 'TEACHER':
              return this.post.writeUser.memberRole === 'MEMBER' ? `${userName} 학부모` : `${userName} 선생님`
            case 'PARENTS':
              return `${userName} 학부모`
            case 'STUDENT':
              return `${userName} 학생`
            default:
              return userName
          }
        } else {
          return '(알수없음)'
        }
      } else {
        return this.post.parentName
      }
    },
    writeUserPhoto() {
      try {
        if (this.isClassPost) {
          return this.post.writeUser.userPhoto && this.post.writeUser.userPhoto.trim().length > 0 ?
              `url('${this.post.writeUser.userPhoto}')` :
              `url('${this.$store.state.userProfileDefault}')`
        } else if (this.isSchoolPost) {
          return this.post.parentImagePath && this.post.parentImagePath.trim().length > 0 ?
              `url('${this.post.parentImagePath}')` :
              `url('${this.$store.state.schoolImageDefault}')`
        } else {
          return `url('${this.post.parentImagePath}')`
        }
      } catch (e) {
        return `url('${this.$store.state.userProfileDefault}')`
      }
    },
    isClassPost() {
      const classPostTypes = ['NOTE', 'ALBUM', 'BOARD', 'HOMEWORK']
      return classPostTypes.includes(this.post.postType)
    },
    isSchoolPost() {
      const schoolPostTypes = ['ALARM', 'NOTICE', 'MEAL', 'HOMEWORK', 'ALARM_PLUS', 'ALARM_EDU_OFFICE']
      return schoolPostTypes.includes(this.post.postType)
    },
    postType() {
      switch (this.post.postType) {
        case 'NOTE':
          return (this.post.board || {}).boardName.includes('공지') ? '공지' : '알림장'
        case 'ALBUM':
          return '앨범'
        case 'BOARD':
          return this.post.board.boardName
        case 'HOMEWORK':
          return '과제게시판'
        case 'CALENDAR_SCHOOL':
          return '학사일정'
        case 'NOTICE':
          return '공지사항'
        case 'ALARM':
          return '가정통신문'
        case 'ALARM_EDU_OFFICE':
          return '가정통신문(교육청)'
        case 'ALARM_PLUS':
          return '학교알리미'
        case 'MEAL':
          return '급식'
        case 'CP_BOARD':
          return this.post.parentName ? this.post.parentName : '하이클래스'
        default:
          return ''
      }
    },
    // 파일목록 표시. 미디어(이미지,비디오) 제외 키워드 포함한 문서만
    includesKeywordFiles() {
      return this.post.files
          .filter(file => {
            const isIncludes = this.post.keywords ?
                this.post.keywords.some(keyword => file.fileName.includes(keyword)) :
                file.fileName.includes(this.searchKeyword)
            return isIncludes && !file.fileContentType.includes('image') && !file.fileContentType.includes('video')
          })
          .map(file => {
            return {
              fileName: this.setHighLight(file.fileName),
              fileOriginalPath: file.fileOriginalPath
            }
          })
    },
    // 첨부파일 개수 표시. 전체 문서 개수
    documentFiles() {
      return this.post.files.filter(file => !file.fileContentType.includes('image') && !file.fileContentType.includes('video'))
    },
    // 썸네일 개수 표시. 전체 미디어(이미지,비디오) 개수
    thumbnailFiles() {
      let files = this.post.files.filter(file => file.fileContentType.includes('image') || file.fileContentType.includes('video'))
      if (this.post.postType === 'CP_BOARD') {
        return files.filter(file => file.fileFlag !== 'THUMBNAIL')
      } else {
        return files
      }
    },
    thumbnail() {
      const thumbnailFile = this.thumbnailFiles[0]
      return thumbnailFile.fileContentType.includes('image') ? thumbnailFile.fileOriginalPath : thumbnailFile.fileThumbnailPath
    }
  },
  methods: {
    ...mapActions(['openPostDetailByPostId']),
    openPostPopup() {
      this.openPostDetailByPostId({ postId: this.post.postId })
    },
    setHighLight(str) {
      if (this.post.keywords && this.post.keywords.length > 0) {
        this.post.keywords.forEach(keyword => {
          str = str.replaceAll(keyword, `<span class="highlight">${keyword}</span>`)
        })
      }
      return str
    },
    trimContent(str) {
      let trimStr = ''
      const domParser = new DOMParser()
      const postContentDocument = domParser.parseFromString(str, 'text/html')
      const contentEl = postContentDocument.body.querySelectorAll('p')

      if (contentEl.length > 1) { // 내용이 1줄 이상
        let includesArr = [] // 키워드 포함여부값 배열
        for (let i = 0; i < contentEl.length; i++) {
          let el = contentEl[i]
          const isKeywordIncludes = this.post.keywords && this.post.keywords.length > 0 ?
              this.post.keywords.some(keyword => el.innerText.includes(keyword)) :
              el.innerText.includes(this.searchKeyword)

          includesArr.push(isKeywordIncludes)
        }

        const firstIndex = includesArr.indexOf(true) // 키워드가 처음으로 포함되는 문장 인덱스
        const lastIndex = includesArr.lastIndexOf(true) // 키워드가 마지막으로 포함되는 문장 인덱스

        if (firstIndex > 0) { // 키워드가 글의 첫문장에 포함이 안되어있으면 말줄임으로 시작
          trimStr += '⋯ '
        }

        for (let j = firstIndex; j < includesArr.length; j++) {
          if (includesArr[j]) { // 키워드 포함이면
            trimStr += contentEl[j].innerHTML

          } else { // 키워드 미포함이면
            if (j > lastIndex) { // 마지막 키워드 포함 이후부터는 전부 표시
              trimStr += contentEl[j].innerHTML
            } else { // 키워드 미포함 문장은 말줄임으로 표시
              if (includesArr[j + 1]) { // 다음 문장에 키워드가 포함되어있으면 말줄임. (말줄임 중복방지)
                trimStr += '⋯'
              }
            }
          }

          if (j < includesArr.length + 1) { // 문장 사이 띄어쓰기
            trimStr += ' '
          }
        }

        if (trimStr === '') { // 포함된 키워드가 하나도 없으므로 원본 내용 표시
          trimStr = str
        }

      } else { // 내용이 1줄
        trimStr = str
      }

      return trimStr
    },
    getPostContent() {
      let content = this.post.listPostContent
      content = this.trimContent(content)
      content = content
          .replaceAll('<p>', '')
          .replaceAll('</p>', '&nbsp')
          .replaceAll('<br>', '&nbsp')
      content = this.setHighLight(content)

      return content
    },
    getPostTitle() {
      let title = ''
      if (this.post.postType === 'NOTE' && !this.post.postTitle) {
        try {
          const schoolType = this.clazzSubscribeViews.find(clazz => clazz.classId === this.post.parentId).classSchoolType
          const postTypeName = this.getPostTypeNameByCode({ code: this.post.postType, type: schoolType })
          title = this.$moment(this.post.posted).format(`M월 D일 (ddd) ${postTypeName}`)
        } catch (e) {
          title = this.$moment(this.post.posted).format(`M월 D일 (ddd) 알림장}`)
        }
      } else {
        title = this.post.postTitle ? this.post.postTitle.replaceAll('>', '&gt;').replaceAll('<', '&lt;') : this.post.postTitle
      }
      return this.setHighLight(title)
    },
  }
}
</script>

<style>
/* 텍스트 replace시 중복된 단어이면 span 태그가 중첩해서 생기면서 스타일이 중복됨. 자식태그 스타일 무효화 ex) 알림, 알림장 */
.page-join-class .join-class-cont-wrap .search-result-content-item .highlight * {
  background: none;
}
</style>