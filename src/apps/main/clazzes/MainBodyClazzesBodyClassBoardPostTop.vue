<template>
  <div
    v-if="filteredPosts.length > 0"
    class="board-notice__list"
  >
    <div
      v-for="post of filteredPosts"
      :key="post.postId"
      role="button"
      class="board-notice__item"
      @click="openPostDetail(post.currentId)"
    > <!-- .top-notice-item -->
      <strong class="heading">
        <span class="label notice">공지</span>
         <span v-html="getPostTitle(post)"></span>
      </strong> <!-- .title.type-note -->
      <span class="date">{{ getPostedStr(post.posted) }}</span>

      <!-- 공지 핀 버튼 -->
      <button
        v-if="isCurClassOwnerOrManager"
        type="button"
        class="btn-pin"
        @click.stop="updatePostPin(post.currentId, false)"
      ></button> <!-- 버튼 클릭 시 공지 취소 -->
      <div
        v-else
        class="btn-pin"
      ></div>
      <!-- // 공지 핀 버튼 -->
    </div>
  </div>

  <div v-else></div>
</template>

<script>
import {eventBus} from "@/main";
import {mapGetters, mapState} from "vuex";

export default {
  name: "main-body-clazzes-body-class-board-post-top",
  props: {
    postType: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      codes: {
        post: {
          NOTE: {
            icon: 'type-note'
          },
          ALBUM: {
            icon: 'type-album'
          },
          BOARD: {
            icon: 'type-free-board'
          },
          HOMEWORK: {
            icon: 'type-homework'
          }
        },
      },
      resources: []
    }
  },
  computed: {
    ...mapState('storeBoard', {
      curBoardId: 'curBoardId'
    }),
    ...mapGetters({
      curClassId: 'curClassId',
      curClassSchoolType: 'curClassSchoolType',
      isCurClassOwnerOrManager: 'isCurClassOwnerOrManager',
      getPostTypeNameByCode: "getPostTypeNameByCode",
    }),
    isBusy() {
      return this.$store.state.isLoading || false
    },
    filteredPosts() {
      return this.resources._embedded && this.resources._embedded.posts
        ? this.resources._embedded.posts.filter(p => !p.del)
        : []
    }
  },
  created() {},
  mounted() {
    this.getClazzPostTop()

    eventBus.$on('get-clazz-post-top', () => {
      this.getClazzPostTop()
    })
    eventBus.$on('update-post-pin', payload => {
      const postId = payload.postId
      const postPin = payload.postPin
      if (postId) this.updatePostPin(postId, postPin)
    })
    eventBus.$on('update-post-pin-proc', payload => {
      const postId = payload.postId
      const postPin = payload.postPin
      if (postId) this.updatePostPinProc(postId, postPin)
    })
    eventBus.$on('delete-post-pin', payload => {
      const postId = payload.postId
      if (postId) this.deletePostPin(postId)
    })
  },
  destroyed() {
    eventBus.$off('get-clazz-post-top')
    eventBus.$off('update-post-pin')
    eventBus.$off('update-post-pin-proc')
    eventBus.$off('delete-post-pin')
  },
  methods: {
    setIsBusy(flag) {
      flag === true
        ? this.$store.commit('setIsLoading', true)
        : this.$store.commit('setIsLoading', false)
    },
    getPostIcon(postType) {
      return {
        [this.codes.post[postType].icon] : true
      } || null
    },
    getPostTitle(post) {
      let postTitle = ""

      if (post.postTitlePoint)
        postTitle += post.postTitlePoint

      if (post.postTitle)
        postTitle += ` ${post.postTitle}`

      if (post.postTitleSub)
        postTitle += ` ${post.postTitleSub}`

      if (!postTitle)
        postTitle = this.$moment(post.posted).format(`M월 D일 (ddd) ${this.getPostTypeName(post.postType)}`)

      return postTitle ? postTitle.replaceAll('>', '&gt;').replaceAll('<', '&lt;') : postTitle
    },
    getPostTypeName(postType) {
      const schoolType = this.curClassSchoolType
      const params = postType === 'NOTE'
        ? { code: postType, type: schoolType }
        : { code: postType }

      return this.getPostTypeNameByCode(params)
    },
    getPostedStr(posted) {
      let dateFormat = 'MM.DD'
      const nowYear = this.$moment().year()
      const paramYear = this.$moment(posted).year()

      if (nowYear - paramYear > 0)
        dateFormat = `YYYY.${dateFormat}`

      return this.$moment(posted).format(dateFormat)
    },
    getClazzPostTop() {
      const classId = this.curClassId
      const postType = this.postType
      const boardId = this.curBoardId
      const params = {}
      if (boardId) {
        params.boardId = boardId
      }

      // boardId 갱신 시 불필요한 요청 방지
      if (postType !== 'ALL' && !boardId) {
        return false
      }

      this.$hiClass.clazzesPostTop.read(params, classId, postType)
        .then(res => {
          if (res.data._embedded.posts.length > 0) {
            res.data._embedded.posts.forEach(post => {
              post.del = false
            })
          }
          this.resources = res.data
        })
        .catch(err => {
          this.$log.warn(err)
          this.resources = []
        })
    },
    updatePostPin(postId, postPin) {
      // let message = ''
      // if (postPin === true)
      //   message = '공지하시겠습니까?'
      // else
      //   message = '상단 공지를 취소하시겠습니까?'

      // const type = 'confirm'
      // const action = {
      //   type: 'eventBus',
      //   event: 'update-post-pin-proc',
      //   params: {
      //     postId,
      //     postPin
      //   }
      // }
      // this.message(message, type, action)
      const msg = postPin === true ? '공지하시겠습니까?' : '상단 공지를 취소하시겠습니까?'
      this.$hiClass.confirm(msg)
        .then(() => {
          this.updatePostPinProc(postId, postPin)
        })
    },
    updatePostPinProc(postId, postPin) {
      if (!this.isBusy) {
        this.setIsBusy(true)

        this.$axios({
          method: 'patch',
          url: `/posts/${postId}/pin`,
          data: { postPin }
        })
          .then(() => {
            this.getClazzPostTop()

            eventBus.$emit(`update-post-pin-by-post-id|${postId}_detail`, postPin)
            eventBus.$emit(`update-post-pin-by-post-id|${postId}_list`, postPin)

            if (postPin) {
              // this.message('공지로 등록했습니다.', 'alert')              
              this.$hiClass.alert('공지로 등록했습니다.')
            }

          })
          .finally(() => {
            this.setIsBusy(false)
          })
      }
    },
    deletePostPin(postId) {
      if (this.resources._embedded && this.resources._embedded.posts.length > 0) {
        const findPost = this.resources._embedded.posts.find(post => post.currentId === postId)
        if (findPost)
          findPost.del = true
      }
    },
    openPostDetail(postId) {
      this.setIsBusy(true)

      this.$axios({
        method: 'get',
        url: `/posts/${postId}`
      })
        .then(res => {
        const postData = res.data

        let obj = {
          item: postData,
          list: [postData],
          totalElements: 1,
          pagePerSize: 1
        }
        this.$store.commit('setItemDetailObj', obj)
        this.$store.commit('setIsShowDetailPostLayer', true)
      })
      .finally(() => {
        this.setIsBusy(false)
      })
    },
    /**
     * modal message
     * @param message
     * @param type
     * @param action
     */
    // message(message, type, action) {
    //   const popupMessage = {
    //     isOpen: true,
    //     message,
    //     type,
    //     action
    //   }
    //   this.$store.commit('setPopupMessage', popupMessage)
    // },
    removeAllTag(html) {
      return html.replace(/(<([^>]+)>)/gi, '')
    }
  }
}
</script>

<style scoped>

</style>