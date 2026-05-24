<template>
  <div
    v-if="isAccessable"
    class="modal slick-modal view-main-detail-modal ofy"
    :class="{ on: showStatus, off: !showStatus }"
    :style="modalStyle"
  >
    <!-- ofy 클래스 : 스크롤 영역 보이게 -->
    <div class="modal-cont-wrap">
      <div class="modal-cont">
        <div class="modal-cont-inner">
          <div class="slide-wrap">
            <button
              v-if="isShowArrowButton"
              ref="prev"
              @click.stop
              @click="prev()"
              class="slick-prev slick-arrow"
              :class="{ 'slick-disabled': isDisabledPrevButton }"
              :disabled="isDisabledPrevButton"
              aria-label="Previous"
              type="button"
              style
            >
              Previous
            </button>
            <button
              v-if="isShowArrowButton"
              class="slick-next slick-arrow"
              :class="{ 'slick-disabled': isDisabledNextButton }"
              :disabled="isDisabledNextButton"
              ref="next"
              @click.stop
              @click="next()"
              aria-label="Next"
              type="button"
              style
            >
              Next
            </button>
            <LayerBody
              @isShowOff="initIsShow"
              :key="curPostUri"
              :post="item"
              :postUri="curPostUri"
              :postsList="postsList"
              :path="path"
              :curSlide="curSlide"
              :parentUriList="parentUriList"
            ></LayerBody>
          </div>
          <div
            class="modal-close-btn modal-close-icon"
            @click="isShow = false"
          ></div>
        </div>
      </div>
    </div>
  </div>
  <div v-else></div>
</template>
<script>
import {mapActions, mapGetters, mapMutations, mapState} from "vuex"

import LayerBody from '@/components/DetailPost/DetailPostItemBody.vue'
import {eventBus} from "@/main";

export default {
  name: 'detail-post-item',
  data() {
    return {
      isShow: true,
      curSlide: 0,
      isLastSlide: false,
      isFirstSlide: true,
      isImgView: false,
      isOpenImgLayer: false,
      curPostUri: '',
      classPostTypeArr: ['NOTE', 'ALBUM', 'BOARD', 'HOMEWORK'],
    }
  },
  props: [
    'item',
    'path',
    'postsList',
    'parentUriList',
    'totalElements',
    'pagePerSize',
    'isUseFileUpload'
  ],
  components: {
    LayerBody,
  },
  computed: {
    ...mapState({
      clazzSubscribeViews: 'clazzSubscribeViews',
      curClazzHomework: 'curClazzHomework',
      itemDetailObj: 'itemDetailObj',
      user: 'user',
    }),
    ...mapState('storeClazzes', {
      classUser: 'classUser'
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    showStatus() {
      if (!this.isShow) this.$emit('close-layer', this.isShow)
      return this.isShow
    },
    modalStyle() {
      let style = ''
      // 상세 레이어 팝업에서 과제현황 레이어 팝업을 추가 호출할 때
      if (this.$store.state.curClazzHomework.status.isOpenDetail === true) {
        style = 'display: block; background: rgba(0,0,0,.7); z-index: 99;'
      }
      return style
    },
    isDisabledPrevButton() {
      return this.curSlide === 0
    },
    isDisabledNextButton() {
      return this.curSlide === this.postsList.length - 1
    },
    isShowArrowButton() {
      return !this.isDisabledPrevButton || !this.isDisabledNextButton
    },
    isAccessable() {
      return this.isManagedPost(this.item) || (
        this.item.postStatus === 'COMPLETE'
        && this.item.userType.includes(this.user.userType !== 'STUDENT' ? 'PARENTS' : 'STUDENT')
        && this.isUseMenu(this.item)
      )
    },
  },
  created() {
    this.curPostUri = `${process.env.VUE_APP_BASE_API_URI}/posts/${this.item.currentId}`
  },
  mounted() {
    if (!this.isAccessable) {
      return this.withoutAcceptPost()
    }
    //조회 권한 체크
    let postRole = []
    let roleName = []
    for (let role of this.item.parentRole) {
      let postUserRole = role.split('_')
      postRole.push(postUserRole[1])

      switch (postUserRole[1]) {
        case 'TEACHER':
          roleName.push('선생님')
          break
        case 'PARENTS':
          roleName.push('학부모')
          break
        case 'STUDENT':
          roleName.push('학생')
          break
        case 'NONMEMBER':
          roleName.push('비회원')
            break
      }
    }
    if (!postRole.includes(this.user.userType)) {
      this.setIsShowDetailPostLayer(false)
      //permission denied
      if(this.$store.state.permissionDeniedToasted){
        let toastMsg = ''
        if (this.item.postType === 'EVENT') {
          toastMsg = `${roleName.join(', ')} 회원만 열람할 수 있는 게시물입니다.<br>마이페이지에서 로그인 된 정보를 확인해주세요.`
        } else {
         toastMsg = '사용 중지된 게시판이거나 읽기 권한이 없습니다.'
        }
        this.$toasted.show(toastMsg)
      }
      this.$store.state.permissionDeniedToasted = true
    }

    // 학교알리미 게시글을 공통 팝업으로 호출한 경우 예외 처리
    if (this.item.postType === 'ALARM_PLUS') {
      // open alarmPlus modal
      this.$nextTick(() => {
        const post = this.item
        this.openAlarmPlusDetailPop({ post })
      })

      // close common modal
      this.isShow = false
    }

    this.checkProfileChange()
    this.slideInit()
  },
  beforeUpdate() {
    if (this.$refs.slick) {
      this.$refs.slick.destroy()
    }
  },
  updated() {
    this.$nextTick(function() {
      if (this.$refs.slick) {
        this.$refs.slick.create(this.setSlickOption())
      }
    })
  },
  beforeDestroy() {
    if (this.item.postCommentUsed
      && this.item.postType !== this.CONSTANTS.POST_TYPE.EVENT
    ) {
      eventBus.$emit(`get-comment-by-post-id|${this.item.currentId}`, 'add')
    }
  },
  methods: {
    ...mapMutations([
      'setIsShowDetailPostLayer',
      'setItemDetailObj',
    ]),
    ...mapActions(['openAlarmPlusDetailPop']),
    ...mapMutations('storeClazzes', ['setClassUser']),
    getPost(uri) {
      this.isGetPost = false

      this.$hiClass.posts
        .read(uri)
        .then(res => {
          this.$log.debug(this.$options.name + ' getPost() res => ', res)
          const post = res.data
          this.curPostUri = post._links.self.href

          let obj = {
            item: post,
            list: this.itemDetailObj.list,
            // totalElements: this.totalElements,
            parentUriList: this.itemDetailObj.parentUriList,
            pagePerSize: this.itemDetailObj.pagePerSize
          }
          this.setItemDetailObj(obj)
          // this.setIsShowDetailPostLayer(true)
        })
        .finally(() => {
          this.isGetPost = true
        })
    },
    slideInit() {
      this.curSlide = this.postsList
        .map(function(d) {
          return `${process.env.VUE_APP_BASE_API_URI}/posts/${d.currentId}`
        })
        .indexOf(this.curPostUri)
      this.curPost = this.postsList
        .map(function(d) {
          return d.currentId
        })
        .indexOf(this.item.currentId)
      if (this.curSlide > 0) this.isFirstSlide = false
      if (this.curSlide === this.postsList.length - 1) this.isLastSlide = true
    },
    next() {
      this.curListOnIdx = 0
      this.curSlide += 1
      const itemCurrentId = this.postsList[this.curSlide].currentId
      this.getPost(`${process.env.VUE_APP_BASE_API_URI}/posts/${itemCurrentId}`)
    },
    prev() {
      this.curListOnIdx = 0
      this.curSlide -= 1
      const itemCurrentId = this.postsList[this.curSlide].currentId
      this.getPost(`${process.env.VUE_APP_BASE_API_URI}/posts/${itemCurrentId}`)
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

      if (this.commentContentLength > 0) flag = true

      this.isShow = flag
    },
    initIsShow(val) {
      this.isShow = val
    },
    onBlurModalClick() {
      // alert("modalClickTest!");
      this.isShow = false
    },
    isManagedPost(post) {
      let flag = false
      const postType = post.postType

      if (!this.classPostTypeArr.includes(postType)) {
        return true
      }

      // 클래스 관리자인 경우
      const parentUri = post.parentUri
      let managedClassList = this.clazzSubscribeViews.filter(
        d => {
          return (
            parentUri.includes(d.classId) &&
            (d.memberRole === 'OWNER' || d.memberRole === 'MANAGER')
          )
        }
      )
      if (managedClassList.length > 0) {
        flag = true
      }

      return flag
    },
    withoutAcceptPost() {
      this.$hiClass.alert('접근권한이 없는 게시물입니다.')
      this.onBlurModalClick()
      this.setItemDetailObj({})
      this.setIsShowDetailPostLayer(false)
    },
    isUseMenu(post) {
      if (!this.classPostTypeArr.includes(post.postType)) return true

      const pushTarget = post.pushTarget
      const user = this.user
      const isManager = this.isManagedPost(post)
      const isMemberParents = !isManager && (user.userType === 'TEACHER' || user.userType === 'PARENTS')
      const isMemberStudent = !isManager && user.userType === 'STUDENT'

      const board = post.board
      return ((post.board || {}).boardStatus !== this.CONSTANTS.BOARD_STATUS.DEACTIVATE)
        && (isManager
            || (post.board.boardPermission || {}).isReadable
            || (pushTarget === 'ALL'
                || (pushTarget === 'PARENTS' && isMemberParents)
                || (pushTarget === 'STUDENT' && isMemberStudent))
              && ((isMemberParents && board.isReadParents) || (isMemberStudent && board.isReadStudent)))
    },
    getEvents(post) {
      this.$hiClass.events
        .read(post.currentId)
        .then(r => {
          this.$set(post, "event", r.data);
        })
        .catch(r => {
          this.$log.debug("DetailPostItem - getEvents Error => ", r);
        });
    },
    async checkProfileChange() {
      if(this.item.board) {
        await this.$hiClass
          .getAcceptSubscribeClassByClassIdAndUserId(this, this.item.board.classId)
          .then(clazzSubscribeViews => {
            const clazzSubscribeView = clazzSubscribeViews[0]
            this.setClassUser({
              ...this.classUser,
              memberChildName: clazzSubscribeView.memberChildName,
              profileId: clazzSubscribeView.profileId,
              userName: clazzSubscribeView.userName,
              userPhoto: clazzSubscribeView.userPhoto
            })
          })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.with-100-per img {
  width: 100%;
  height: 100%;
}
.on {
  display: block;
}
.off {
  display: none;
}
.share-btn-wrap.on div .share-popup-wrap {
  display: block;
}
.video-view-wrap video {
  display: block;
  margin: 0 auto;
  width: 90%;
  height: 90%;
}
</style>
